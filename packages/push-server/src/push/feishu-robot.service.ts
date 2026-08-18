import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { createHmac } from 'crypto';
import * as dayjs from 'dayjs';

interface FeishuNews {
  tag?: string;
  ctime?: string | number;
  field?: Array<{ name: string; stockCode: string }>;
  stock?: Array<{ name: string; stockCode: string }>;
}

@Injectable()
export class FeishuRobotService {
  private readonly logger = new Logger(FeishuRobotService.name);
  private readonly webhookUrls: string[];
  private readonly signingSecrets: string[];

  constructor(private readonly config: ConfigService) {
    this.webhookUrls = this.parseList(this.config.get<string>('FEISHU_WEBHOOK_URLS'));
    this.signingSecrets = this.parseList(this.config.get<string>('FEISHU_SIGNING_SECRETS'));
  }

  isEnabled() {
    return this.webhookUrls.length > 0;
  }

  async notice(serviceName: string, msgContent: string) {
    const content = [
      `**服务：** ${serviceName}`,
      `**环境：** ${this.config.get<string>('NODE_ENV') || 'unknown'}`,
      `**时间：** ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
      '',
      msgContent,
    ].join('\n');

    return this.pushCard('服务告警', content, 'red');
  }

  async noticeNews(newsTitle: string, msgContent: string, newsUrl: string, news?: FeishuNews) {
    const content = [
      news?.tag ? `**标签：** ${news.tag}` : '',
      `**${newsTitle}**`,
      msgContent,
      this.prepareStocks(news),
      `**时间：** ${this.getNewsTime(news)}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    return this.pushCard(news?.tag ? `【${news.tag}】${newsTitle}` : newsTitle, content, 'blue', newsUrl);
  }

  private prepareStocks(news?: FeishuNews) {
    if (!news?.tag || (!news.tag.includes('A股') && !news.tag.includes('异动'))) {
      return '';
    }

    const fields = (news.field || []).map(item => `[${item.name}(${item.stockCode})](http://q.10jqka.com.cn/thshy/detail/code/${item.stockCode})`);
    const stocks = (news.stock || []).map(item => `[${item.name}(${item.stockCode})](https://stockpage.10jqka.com.cn/${item.stockCode}/)`);
    return [...fields, ...stocks].join(' ');
  }

  private getNewsTime(news?: FeishuNews) {
    const timestamp = Number(news?.ctime);
    return timestamp ? dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss');
  }

  private async pushCard(title: string, content: string, template: string, url?: string) {
    if (!this.isEnabled()) {
      return [];
    }

    const elements: any[] = [
      {
        tag: 'div',
        text: { tag: 'lark_md', content },
      },
    ];

    if (url) {
      elements.push({
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '查看详情' },
            type: 'primary',
            url,
          },
        ],
      });
    }

    const card = {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          template,
          title: { tag: 'plain_text', content: title.substring(0, 100) },
        },
        elements,
      },
    };

    return Promise.allSettled(
      this.webhookUrls.map((webhookUrl, index) => this.send(webhookUrl, this.signingSecrets[index], card)),
    );
  }

  private async send(webhookUrl: string, secret: string, card: any) {
    const body = secret ? { ...card, ...this.createSignature(secret) } : card;
    const response = await fetch(webhookUrl, {
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      method: 'POST',
    });
    const result: any = await response.json();

    if (!response.ok || (result.code !== undefined && result.code !== 0)) {
      const error = new Error(`飞书机器人推送失败: HTTP ${response.status}, code=${result.code}, msg=${result.msg || ''}`);
      this.logger.error(error.message);
      throw error;
    }

    return result;
  }

  private createSignature(secret: string) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const stringToSign = `${timestamp}\n${secret}`;
    const sign = createHmac('sha256', stringToSign).update('').digest('base64');
    return { timestamp, sign };
  }

  private parseList(value?: string) {
    return (value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
}
