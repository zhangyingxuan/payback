import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import * as dayjs from 'dayjs';

/**
 * 企微机器人 通知
 */
@Injectable()
export class QyWechatNotice {
  constructor() { }

  private readonly logger = new Logger(QyWechatNotice.name);

  async notice(serviceName, msgContent = '哎哟，不错哦') {
    const todayDateStr = new Date();
    const body = {
      msgtype: 'markdown',
      markdown: {
        content: `服务告警 <font color=\"warning\">[${serviceName}]</font> <font color=\"comment\">${dayjs(
          todayDateStr,
        ).format('MM-DD HH:mm:ss')}</font>\n
        > 错误日志: <font color=\"comment\">${msgContent}</font>`,
        mentioned_list: ['yxuanzhang', '@all'],
        mentioned_mobile_list: ['13800001111', '@all'],
      },
    };
    return await fetch('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=474f2a05-c848-4049-b7f0-90630374a408', {
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
        console.log(data);
        return data;
      })
      .catch(e => console.error(e));
  }
}
