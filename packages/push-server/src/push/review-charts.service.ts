import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import fetch from 'node-fetch';
import { renderAsync } from '@resvg/resvg-js';
import { PushService, feishuWebhookUrls, feishuSigningSecrets } from './push.service';

interface ChartPayload {
  data_as_of: string;
  charts: { name: string; svg_base64: string }[];
}

// 固定尺寸分段保持文字清晰，避免长梯队超过企微单张图片限制。
export async function renderChartParts(encoded: string): Promise<Buffer[]> {
  if (typeof encoded !== 'string' || encoded.length > 6 * 1024 * 1024) throw new Error('图表大小无效');
  const decoded = Buffer.from(encoded, 'base64');
  const svg = decoded.toString('utf8');
  const size = svg.match(/^<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/);
  if (decoded.toString('base64') !== encoded || !size || ![990, 1200].includes(+size[1]) || +size[2] < 1 || +size[2] > 60000
      || /<!DOCTYPE|<!ENTITY|<script|<foreignObject|\b(?:href|xlink:href)\s*=/i.test(svg)) {
    throw new Error('图表格式或尺寸无效');
  }
  const images: Buffer[] = [];
  for (let y = 0; y < +size[2]; y += 1600) {
    const height = Math.min(1600, +size[2] - y);
    const part = `<svg xmlns="http://www.w3.org/2000/svg" width="${size[1]}" height="${height}" viewBox="0 ${y} ${size[1]} ${height}">${svg}</svg>`;
    // 字体排版可能耗时，交由原生工作线程处理，避免阻塞新闻等实时推送。
    const image = (await renderAsync(part, { font: { loadSystemFonts: true, defaultFontFamily: 'Noto Sans CJK SC' } })).asPng();
    if (image.length > 2 * 1024 * 1024) throw new Error('分图超过企微 2 MiB 限制');
    images.push(image);
  }
  return images;
}

@Injectable()
export class ReviewChartsPushService {
  private readonly logger = new Logger(ReviewChartsPushService.name);
  private date = '';
  // shortcut: 成功记录仅保留在进程内，多实例部署或要求重启去重时改为持久化回执。
  private sent = new Set<string>();
  private uploaded = new Map<number, string>();
  private pending?: Promise<{ ok: boolean; failures: string[] }>;

  constructor(private readonly pushService: PushService) {}

  async push(payload: ChartPayload) {
    // 合并超时重试产生的并发请求，避免同一群收到重复图片。
    if (this.pending) {
      if (payload?.data_as_of !== this.date) throw new Error('另一交易日的双图正在推送');
      return this.pending;
    }
    this.pending = this.deliver(payload).finally(() => { this.pending = undefined; });
    return this.pending;
  }

  private async deliver(payload: ChartPayload) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload?.data_as_of || '') || !Array.isArray(payload.charts)
        || payload.charts.length !== 2 || payload.charts[0]?.name !== 'panorama' || payload.charts[1]?.name !== 'ladder') {
      throw new Error('双图推送参数无效');
    }
    if (this.date !== payload.data_as_of) {
      this.date = payload.data_as_of;
      this.sent.clear();
      this.uploaded.clear();
    }
    const images: Buffer[] = [];
    for (const chart of payload.charts) images.push(...await renderChartParts(chart.svg_base64));
    let token: Promise<string> | undefined;
    const channels = [
      ...this.pushService.robotList.map((robot, index) => ({
        name: `wecom:${index}`,
        send: async (image: Buffer) => {
          const result = await this.pushService.qyapi(robot, {
            msgtype: 'image', image: { base64: image.toString('base64'), md5: createHash('md5').update(image).digest('hex') },
          });
          if (result?.errcode !== 0) throw new Error('企微图片推送失败');
        },
      })),
      ...feishuWebhookUrls.map((webhook, index) => ({
        name: `feishu:${index}`,
        send: async (image: Buffer, imageIndex: number) => {
          let key = this.uploaded.get(imageIndex);
          if (!key) {
            token ??= this.getToken();
            key = await this.upload(image, await token);
            this.uploaded.set(imageIndex, key);
          }
          await this.pushService.sendFeishu(webhook, feishuSigningSecrets[index], {
            msg_type: 'image', content: { image_key: key },
          });
        },
      })),
    ];
    // 通道独立执行；单通道中按图序发送，失败后只重试尚未确认成功的图片。
    const results = await Promise.allSettled(channels.map(async channel => {
      for (let index = 0; index < images.length; index++) {
        const id = `${channel.name}:${index}`;
        if (this.sent.has(id)) continue;
        await channel.send(images[index], index);
        this.sent.add(id);
        if (index < images.length - 1) await this.pause();
      }
    }));
    const failures = results.flatMap((result, index) => result.status === 'rejected' ? [channels[index].name] : []);
    if (failures.length) this.logger.error(`收盘双图推送失败通道：${failures.join(', ')}；请检查凭据、权限和机器人状态`);
    return { ok: failures.length === 0, failures };
  }

  private pause() {
    // 长梯队按每分钟少于 20 张发送，为企微机器人保留基本频控间隔。
    return new Promise(resolve => setTimeout(resolve, 3100));
  }

  private async getToken(): Promise<string> {
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;
    if (!appId || !appSecret) throw new Error('缺少 FEISHU_APP_ID / FEISHU_APP_SECRET，无法上传飞书图片');
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST', timeout: 15000, headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });
    const result = await response.json();
    if (!response.ok || result.code !== 0 || !result.tenant_access_token) throw new Error('获取飞书图片上传令牌失败');
    return result.tenant_access_token;
  }

  private async upload(image: Buffer, token: string): Promise<string> {
    // 使用标准 multipart 格式上传内存图片，无需临时文件或额外表单依赖。
    const boundary = `review-${randomUUID()}`;
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image_type"\r\n\r\nmessage\r\n--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="review.png"\r\nContent-Type: image/png\r\n\r\n`),
      image, Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    const response = await fetch('https://open.feishu.cn/open-apis/im/v1/images', {
      method: 'POST', timeout: 15000, body,
      headers: { authorization: `Bearer ${token}`, 'content-type': `multipart/form-data; boundary=${boundary}` },
    });
    const result = await response.json();
    if (!response.ok || result.code !== 0 || !result.data?.image_key) throw new Error('上传飞书图片失败，请检查应用图片权限');
    return result.data.image_key;
  }
}
