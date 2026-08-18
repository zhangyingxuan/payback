import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import * as dayjs from 'dayjs';
import { FeishuRobotService } from './feishu-robot.service';

const thsPlateBaseUrl = 'http://q.10jqka.com.cn/thshy/detail/code/';
const thsStockBaseUrl = 'https://stockpage.10jqka.com.cn/';

/**
 * 企微机器人 通知
 */
@Injectable()
export class PushService {
  constructor(private readonly feishuRobotService: FeishuRobotService) { }

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
    const body = {
      msgtype: 'markdown',
      markdown: {
        content: content.join(''),
      },
    };
    const results = await Promise.allSettled([
      this.pushMsg2Robot(body),
      this.feishuRobotService.notice(serviceName, msgContent),
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
    const body = {
      msgtype: 'markdown',
      markdown: {
        content: content.join(''),
      },
    };
    const results = await Promise.allSettled([
      this.pushMsg2Robot(body),
      this.feishuRobotService.noticeNews(newsTitle, msgContent, newsUrl, news),
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
