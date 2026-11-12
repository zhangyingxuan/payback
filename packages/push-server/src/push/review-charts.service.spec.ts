import fetch from 'node-fetch';
import { ReviewChartsPushService, renderChartParts } from './review-charts.service';
import { PushService } from './push.service';

jest.mock('node-fetch', () => ({ __esModule: true, default: jest.fn() }));
const request = fetch as unknown as jest.Mock;
const svg = (height = 100) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}"><rect width="1200" height="${height}" fill="red"/></svg>`).toString('base64');
const payload = () => ({ data_as_of: '2026-11-12', charts: ['panorama', 'ladder'].map(name => ({ name, svg_base64: svg() })) });

describe('收盘双图推送', () => {
  let push: any;
  let service: ReviewChartsPushService;
  beforeEach(() => {
    process.env.FEISHU_APP_ID = 'test-app';
    process.env.FEISHU_APP_SECRET = 'test-secret';
    push = { robotList: ['test-robot'], qyapi: jest.fn().mockResolvedValue({ errcode: 0 }), sendFeishu: jest.fn().mockResolvedValue({ code: 0 }) };
    service = new ReviewChartsPushService(push);
    request.mockReset().mockImplementation(async (url: string) => ({ ok: true, status: 200, json: async () => url.includes('/auth/') ? { code: 0, tenant_access_token: 'token' } : { code: 0, data: { image_key: 'image' } } }));
    // 测试不等待通道限流时间，也不实际发送任何群消息。
    jest.spyOn(service as any, 'pause').mockResolvedValue(undefined);
  });
  afterEach(() => {
    delete process.env.FEISHU_APP_ID;
    delete process.env.FEISHU_APP_SECRET;
  });

  it('原尺寸长图分段为合法 PNG，拒绝不受控尺寸', async () => {
    const images = await renderChartParts(svg(3400));
    expect(images.map(image => image.readUInt32BE(20))).toEqual([1600, 1600, 200]);
    expect(images.every(image => image.subarray(1, 4).toString() === 'PNG' && image.length <= 2 * 1024 * 1024)).toBe(true);
    const panorama = Buffer.from(Buffer.from(svg(), 'base64').toString().replace(/1200/g, '990')).toString('base64');
    expect((await renderChartParts(panorama))[0].readUInt32BE(16)).toBe(990);
    await expect(renderChartParts(svg(1000000))).rejects.toThrow();
    await expect(renderChartParts('invalid')).rejects.toThrow();
  });

  it('发送两张图片到两个通道，重复任务不重复发图', async () => {
    expect((await service.push(payload())).ok).toBe(true);
    expect(push.qyapi).toHaveBeenCalledTimes(2);
    expect(push.qyapi.mock.calls[0][1]).toMatchObject({ msgtype: 'image', image: { base64: expect.any(String), md5: expect.stringMatching(/^[a-f0-9]{32}$/) } });
    expect(push.sendFeishu).toHaveBeenCalledTimes(2);
    expect((await service.push(payload())).ok).toBe(true);
    expect(push.qyapi).toHaveBeenCalledTimes(2);
    expect(push.sendFeishu).toHaveBeenCalledTimes(2);
  });

  it('飞书失败不阻塞企微，重试仅发送失败图片', async () => {
    push.sendFeishu.mockRejectedValueOnce(new Error('失败'));
    expect((await service.push(payload())).ok).toBe(false);
    expect(push.qyapi).toHaveBeenCalledTimes(2);
    expect((await service.push(payload())).ok).toBe(true);
    expect(push.qyapi).toHaveBeenCalledTimes(2);
    expect(push.sendFeishu).toHaveBeenCalledTimes(3);
  });

  it('飞书凭据缺失仍推企微，企微业务错误不算成功', async () => {
    delete process.env.FEISHU_APP_SECRET;
    push.qyapi.mockResolvedValueOnce({ errcode: 93000 });
    const result = await service.push(payload());
    expect(result.ok).toBe(false);
    expect(result.failures).toEqual(expect.arrayContaining(['feishu:0', 'wecom:0']));
    expect(push.qyapi).toHaveBeenCalledTimes(1);
  });

  it('飞书上传错误不误判成功', async () => {
    request.mockResolvedValue({ ok: true, status: 200, json: async () => ({ code: 9999 }) });
    expect((await service.push(payload())).ok).toBe(false);
    expect(push.sendFeishu).not.toHaveBeenCalled();
    expect(push.qyapi).toHaveBeenCalledTimes(2);
  });

  it('真实机器人请求校验 HTTP 与业务码，兼容飞书旧版成功回执', async () => {
    const actual = new PushService();
    request.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ errcode: 0 }) });
    await expect(actual.qyapi('test-robot', {})).rejects.toThrow('HTTP 500');
    request.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ StatusCode: 0 }) });
    await expect(actual.sendFeishu('https://example.test/bot', '', {})).resolves.toEqual({ StatusCode: 0 });
    request.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ code: 9999 }) });
    await expect(actual.sendFeishu('https://example.test/bot', '', {})).rejects.toThrow('code=9999');
  });
});
