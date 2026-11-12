import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import fetch from 'node-fetch';
import { lastValueFrom, timeout } from 'rxjs';
import { toShanghaiDate } from 'pay-back-core';

@Injectable()
export class ReviewChartsService {
  private readonly logger = new Logger(ReviewChartsService.name);
  private snapshot?: { data_as_of: string; charts: { name: string; svg_base64: string }[] };

  constructor(@Inject('PUSH_SERVER') private readonly pushServer: ClientProxy) {}

  async pushDailyCharts() {
    const date = toShanghaiDate();
    // 重试必须沿用同一份图，避免成功与失败通道收到不同版本的收盘快照。
    if (this.snapshot?.data_as_of !== date) {
      const base = (process.env.PAYBACK_AGENT_URL || 'http://127.0.0.1:8300').replace(/\/$/, '');
      const response = await fetch(`${base}/review-charts/${date}`, { method: 'POST', timeout: 90000 });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '生成收盘双图失败');
      if (result.data_as_of !== date || !Array.isArray(result.charts)) throw new Error('双图数据日期或格式错误');
      this.snapshot = result;
    }
    // 请求响应模式确认各机器人回执，超时和部分失败由现有调度器重试。
    const result = await lastValueFrom(this.pushServer.send('pushReviewCharts', this.snapshot).pipe(timeout(300000)));
    if (result?.ok !== true) throw new Error(`收盘双图未全部送达：${result?.failures?.join(', ') || '回执无效'}`);
    this.logger.log(`${date} 复盘全景图和涨停梯队图已推送飞书、企微`);
  }
}
