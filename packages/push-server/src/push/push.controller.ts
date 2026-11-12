import { Controller } from '@nestjs/common';
import { PushService } from './push.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ReviewChartsPushService } from './review-charts.service';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService, private readonly reviewCharts: ReviewChartsPushService) { }

  // 双图采用请求响应，让调度方能重试失败通道而不是只确认消息已发出。
  @MessagePattern('pushReviewCharts')
  pushReviewCharts(payload) {
    return this.reviewCharts.push(payload);
  }

  @EventPattern('noticeNews')
  noticeNews(newsTitle, msgContent = '哎哟，不错哦', newsUrl, news?: any): any {
    return this.pushService.noticeNews(newsTitle, msgContent, newsUrl, news);
  }

  @EventPattern('notice')
  notice(serviceName, msgContent): any {
    return this.pushService.notice(serviceName, msgContent);
  }

  @EventPattern('pushMorningMessage')
  pushMorningMessage(payload): any {
    return this.pushService.pushMorningMessage(payload);
  }
}
