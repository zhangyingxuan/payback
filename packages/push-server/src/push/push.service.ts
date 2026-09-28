import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import * as dayjs from 'dayjs';
import { createHmac } from 'crypto';

const thsPlateBaseUrl = 'http://q.10jqka.com.cn/thshy/detail/code/';
const thsStockBaseUrl = 'https://stockpage.10jqka.com.cn/';
const feishuWebhookUrls = [
  'https://open.feishu.cn/open-apis/bot/v2/hook/d3876526-1889-44de-a2fc-3df92f1c0442',
];
const feishuSigningSecrets: string[] = [];

/**
 * 企微机器人 通知
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly robotList = [
    'ddbae7ea-7496-4cd8-97c5-c0b195d9609b',
    '474f2a05-c848-4049-b7f0-90630374a408',
  ];

  /**
   * 告警通知
   * @param serviceName
   * @param msgContent
   * @returns
   */
  async notice(serviceName, msgContent = '哎哟，不错哦') {
    const todayDateStr = new Date();
    const content = [];
    content.push(`**【服务告警】**`);
    content.push(` <font color=\"red\">**${serviceName}**</font>`);
    content.push(` <font color=\"warning\">${process.env.NODE_ENV}</font>`);
    content.push(
      ` <font color=\"comment\">${dayjs(todayDateStr).format(
        'HH:mm:ss',
      )}</font>\n`,
    );
    content.push(`> <font color=\"comment\">${msgContent}</font>`);
    const markdownContent = content.join('');
    const body = {
      msgtype: 'markdown',
      markdown: {
        content: markdownContent,
      },
    };
    const results = await Promise.allSettled([
      this.pushMsg2Robot(body),
      this.pushFeishuMarkdown(markdownContent),
    ]);
    this.logRejectedChannels(results);
    return results;
  }
  /**
   * 准备标签内容
   * @param tags
   * @param baseUrl
   * @returns
   */
  prepareTagContent(tags, baseUrl) {
    const tagContent = [];
    tags.forEach((tag) => {
      tagContent.push(
        `[${tag.name}(${tag.stockCode})](${baseUrl + tag.stockCode}) `,
      );
    });
    return tagContent.join('');
  }
  /**
   * 准备消息内容，涨跌 关键字颜色标注
   * @param tags
   * @param baseUrl
   * @returns
   */
  prepareMsgWord(newsTitle) {
    newsTitle = newsTitle.replace('涨', '<font color="#ff0000">涨</font>');
    newsTitle = newsTitle.replace('跌', '<font color="#2db688">跌</font>');
    return newsTitle;
  }
  /**
   * 新闻通知
   * @param newsTitle
   * @param msgContent markdown内容，最长不超过2048个字节，必须是utf8编码
   * @param newsUrl
   * @returns
   */
  async noticeNews(
    newsTitle,
    msgContent = '哎哟，不错哦',
    newsUrl,
    news?: any,
  ) {
    const content = [];

    content.push(`**【${news?.tag}】**`);
    content.push(
      ` [<font color=\"#3858e6\">**${this.prepareMsgWord(
        newsTitle,
      )}**</font>](${newsUrl})`,
    );
    content.push(
      ` <font color=\"comment\">${dayjs(new Date(+news.ctime * 1000)).format(
        'HH:mm:ss',
      )}</font>\n`,
    );
    content.push(`> <font color=\"comment\">${msgContent}</font>\n\n`);
    if (news.tag && (news.tag.includes('A股') || news.tag.includes('异动'))) {
      // field 板块 name、stockCode、stockMarket
      if (news?.field?.length > 0) {
        content.push(this.prepareTagContent(news?.field, thsPlateBaseUrl));
      }
      // stock 个股 name、stockCode、stockMarket
      if (news?.stock?.length > 0) {
        content.push(this.prepareTagContent(news?.stock, thsStockBaseUrl));
      }
    }
    const markdownContent = content.join('');
    const body = {
      msgtype: 'markdown',
      markdown: {
        content: markdownContent,
      },
    };
    const results = await Promise.allSettled([
      this.pushMsg2Robot(body),
      this.pushFeishuMarkdown(markdownContent),
    ]);
    this.logRejectedChannels(results);
    return results;
  }

  /**
   * 早盘推送：今日新股 + 集合竞价涨停（按封单量排序）到飞书卡片/企微
   * @param payload { newStocks, auctionLimitUp }
   */
  async pushMorningMessage(payload) {
    const todayDateStr = dayjs().format('YYYY-MM-DD');
    const { newStocks = [], auctionLimitUp = [] } = payload || {};

    // 封单量默认单位为亿（原始单位为手）
    const formatSeal = (item) => `${((item.sealQuantity || 0) / 1e8).toFixed(2)}亿`;
    // 6位编码（去掉交易所后缀）
    const code6 = (item) => String(item.code || '').split('.')[0];
    // 二级板块（取第二个层级，如 传媒-文化传媒-出版 → 文化传媒）
    const plate2 = (item) => String(item.plateLevel2 || '').split('-')[1] || item.plateLevel2 || '';

    // 个股行：名称(带链接) + 6位编码 + 封单 + 二级板块，不展示涨幅
    const stockLine = (item, index, showSeal) => {
      const code = code6(item);
      const seal = showSeal ? ` ｜ 封单 <font color="red">${formatSeal(item)}</font>` : '';
      return `${index + 1}. [${item.name}](${thsStockBaseUrl + code})(${code})${seal} | ${plate2(item)}`;
    };

    // 飞书富文本卡片（带 header，渲染为真正卡片）
    const elements = [];
    elements.push({
      tag: 'div',
      text: { tag: 'lark_md', content: `**集合竞价涨停（${auctionLimitUp.length}，按封单量）**` },
    });
    if (auctionLimitUp.length > 0) {
      auctionLimitUp.slice(0, 20).forEach((item, index) => {
        elements.push({ tag: 'div', text: { tag: 'lark_md', content: stockLine(item, index, true) } });
      });
    } else {
      elements.push({ tag: 'div', text: { tag: 'lark_md', content: '> 无' } });
    }
    elements.push({ tag: 'hr' });
    elements.push({
      tag: 'div',
      text: { tag: 'lark_md', content: `**今日上市新股（${newStocks.length}）**` },
    });
    if (newStocks.length > 0) {
      newStocks.forEach((item, index) => {
        elements.push({ tag: 'div', text: { tag: 'lark_md', content: stockLine(item, index, false) } });
      });
    } else {
      elements.push({ tag: 'div', text: { tag: 'lark_md', content: '> 无' } });
    }

    const card = {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        header: {
          title: { tag: 'plain_text', content: `早盘 集合竞价 ${todayDateStr}` },
          template: 'blue',
        },
        elements,
      },
    };

    // 企微 markdown（同格式，无链接）
    const content = [];
    content.push(`**【早盘 集合竞价】** ${todayDateStr}\n`);
    content.push(`**集合竞价涨停（${auctionLimitUp.length}，按封单量）**\n`);
    if (auctionLimitUp.length > 0) {
      auctionLimitUp.slice(0, 20).forEach((item, index) => {
        content.push(
          `${index + 1}. ${item.name}(${code6(item)}) 封单 ${formatSeal(item)} | ${plate2(item)}\n`,
        );
      });
    } else {
      content.push(`> 无\n`);
    }
    content.push(`**今日上市新股（${newStocks.length}）**\n`);
    if (newStocks.length > 0) {
      newStocks.forEach((item, index) => {
        content.push(`${index + 1}. ${item.name}(${code6(item)}) | ${plate2(item)}\n`);
      });
    } else {
      content.push(`> 无\n`);
    }

    const results = await Promise.allSettled([
      this.sendFeishu(feishuWebhookUrls[0], feishuSigningSecrets[0], card),
      this.pushMsg2Robot({
        msgtype: 'markdown',
        markdown: { content: content.join('') },
      }),
    ]);
    this.logRejectedChannels(results);
    return results;
  }

  pushMsg2Robot(body) {
    return Promise.allSettled(this.robotList.map((robotKey) => this.qyapi(robotKey, body)));
  }

  private logRejectedChannels(results: PromiseSettledResult<any>[]) {
    results.forEach((result) => {
      if (result.status === 'rejected') {
        this.logger.error(result.reason);
      }
    });
  }

  private async pushFeishuMarkdown(content: string) {
    const card = {
      msg_type: 'interactive',
      card: {
        config: { wide_screen_mode: true },
        elements: [
          {
            tag: 'div',
            text: { tag: 'lark_md', content },
          },
        ],
      },
    };

    return Promise.allSettled(
      feishuWebhookUrls.map((webhookUrl, index) =>
        this.sendFeishu(webhookUrl, feishuSigningSecrets[index], card),
      ),
    );
  }

  private async sendFeishu(webhookUrl: string, secret: string, card: any) {
    const body = secret ? { ...card, ...this.createFeishuSignature(secret) } : card;
    const response = await fetch(webhookUrl, {
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      method: 'POST',
    });
    const result: any = await response.json();

    if (!response.ok || (result.code !== undefined && result.code !== 0)) {
      const error = new Error(
        `飞书机器人推送失败: HTTP ${response.status}, code=${result.code}, msg=${result.msg || ''}`,
      );
      this.logger.error(error.message);
      throw error;
    }

    return result;
  }

  private createFeishuSignature(secret: string) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const stringToSign = `${timestamp}\n${secret}`;
    const sign = createHmac('sha256', stringToSign)
      .update('')
      .digest('base64');
    return { timestamp, sign };
  }

  /**
   * 企业微信机器人API
   * @param robotKey
   * @param body
   */
  async qyapi(robotKey, body) {
    try {
      const response = await fetch(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${robotKey}`, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        pragma: 'no-cache',
      },
      body: JSON.stringify(body),
      referrerPolicy: 'strict-origin-when-cross-origin',
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      });
      return await response.json();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
