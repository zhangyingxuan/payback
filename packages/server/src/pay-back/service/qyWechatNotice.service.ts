import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import * as dayjs from 'dayjs';

const thsPlateBaseUrl = 'http://q.10jqka.com.cn/thshy/detail/code/';
const thsStockBaseUrl = 'https://stockpage.10jqka.com.cn/';

/**
 * 企微机器人 通知
 */
@Injectable()
export class QyWechatNotice {
  constructor() { }

  private readonly NODE_ENV = process.env.NODE_ENV;
  private readonly logger = new Logger(QyWechatNotice.name);
  private readonly robotList = ['ddbae7ea-7496-4cd8-97c5-c0b195d9609b', '474f2a05-c848-4049-b7f0-90630374a408'];

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
    content.push(` <font color=\"warning\">${this.NODE_ENV}</font>`);
    content.push(` <font color=\"comment\">${dayjs(todayDateStr).format('HH:mm:ss')}</font>\n`);
    content.push(`> <font color=\"comment\">${msgContent}</font>`);
    const body = {
      msgtype: 'markdown',
      markdown: {
        content: content.join(''),
        mentioned_list: ['yxuanzhang', '@all'],
        // mentioned_mobile_list: ['13800001111', '@all'],
      },
    };
    return await this.pushMsg2Robot(body);
  }
  /**
   * 准备标签内容
   * @param tags
   * @param baseUrl
   * @returns
   */
  prepareTagContent(tags, baseUrl) {
    const tagContent = [];
    tags.forEach(tag => {
      tagContent.push(`[${tag.name}](${baseUrl + tag.stockCode}) `);
    });
    return tagContent.join('');
  }
  /**
   * 新闻通知
   * @param newsTitle
   * @param msgContent
   * @param newsUrl
   * @returns
   */
  async noticeNews(newsTitle, msgContent = '哎哟，不错哦', newsUrl, news?: any) {
    const todayDateStr = new Date();
    const content = [];
    content.push(`**【${news?.tag}】**`);
    content.push(` [<font color=\"#3858e6\">**${newsTitle}**</font>](${newsUrl})`);
    content.push(` <font color=\"comment\">${dayjs(todayDateStr).format('HH:mm:ss')}</font>\n`);
    content.push(`> <font color=\"comment\">${msgContent}</font>\n\n`);
    if (news.tag && news.tag.includes('A股')) {
      // field 板块 name、stockCode、stockMarket
      if (news?.field?.length > 0) {
        content.push(this.prepareTagContent(news?.field, thsPlateBaseUrl));
      }
      // stock 个股 name、stockCode、stockMarket
      if (news?.stock?.length > 0) {
        content.push(this.prepareTagContent(news?.stock, thsStockBaseUrl));
      }
    }
    const body = {
      msgtype: 'markdown',
      markdown: {
        content: content.join(''),
        mentioned_list: ['yxuanzhang', '@all'],
        // mentioned_mobile_list: ['13800001111', '@all'],
      },
    };
    return await this.pushMsg2Robot(body);
  }

  pushMsg2Robot(body) {
    this.robotList.forEach(async robotKey => {
      this.qyapi(robotKey, body);
    });
  }

  /**
   * 企业微信机器人API
   * @param robotKey
   * @param body
   */
  qyapi(robotKey, body) {
    fetch(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${robotKey}`, {
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
    })
      .then(async response => await response.json())
      .then(data => {
        return data;
      })
      .catch(e => this.logger.error(e));
  }
}
