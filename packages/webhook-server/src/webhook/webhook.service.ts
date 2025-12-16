import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WebhookDto } from './dto/webhook.dto';
const querystring = require('querystring');


@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private configService: ConfigService) { }

  /**
   * 生成 Gitee 风格的签名
   * @param {string} secret 密钥
   * @returns {object} { timestamp, signature }
   */
  generateSignature(secret) {
    const timestamp = Date.now();
    const stringToSign = `${timestamp}\n${secret}`;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);

    const signData = hmac.digest();
    const base64Sign = signData.toString('base64');
    const urlEncodedSign = querystring.escape(base64Sign);

    return { timestamp, signature: urlEncodedSign };
  }

  /**
   * 验证 Gitee 签名
   * @param {number} timestamp 时间戳
   * @param {string} receivedSignature 接收到的签名
   * @param {number} tolerance 时间容差（毫秒，默认5分钟）
   * @returns {boolean} 是否有效
   */
  verifySignature(timestamp, receivedSignature, tolerance = 3600000) {
    // 1. 检查时间戳是否在有效范围内
    const currentTimestamp = Date.now();
    if (Math.abs(currentTimestamp - timestamp) > tolerance) {
      console.warn('Signature expired or timestamp invalid');
      return false;
    }

    const secret = this.configService.get<string>("WEBHOOK_SECRET");
    // 2. 重新计算签名
    const stringToSign = `${timestamp}\n${secret}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    const signData = hmac.digest();
    const expectedBase64 = signData.toString('base64');
    const expectedSignature = querystring.escape(expectedBase64);

    // 3. 安全比较签名
    return this.safeCompare(receivedSignature, expectedSignature);
  }

  /**
   * 安全比较两个字符串（防止时序攻击）
   */
  safeCompare(a, b) {
    if (a.length !== b.length) return false;

    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);

    return crypto.timingSafeEqual(bufA, bufB);
  }

  isWatchDirChanged(commits: WebhookDto['commits']): boolean {
    const watchDirs = this.configService.get<string>('WATCH_DIRS').split(',');

    for (const commit of commits) {
      const changedFiles = [
        ...(commit.added || []),
        ...(commit.modified || []),
        ...(commit.removed || []),
      ];

      for (const file of changedFiles) {
        for (const dir of watchDirs) {
          const normalizedDir = dir.endsWith('/') ? dir : `${dir}/`;
          if (file.startsWith(normalizedDir)) {
            this.logger.log(`Detected change in watch dir: ${file} (dir: ${dir})`);
            return true;
          }
        }
      }
    }

    return false;
  }
}