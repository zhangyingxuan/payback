import { Controller } from '@nestjs/common';
import { PushService } from './push.service';
import { EventPattern } from '@nestjs/microservices';

@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) { }

  @EventPattern('noticeNews')
  noticeNews(newsTitle, msgContent = '哎哟，不错哦', newsUrl, news?: any): any {
    return this.pushService.noticeNews(newsTitle, msgContent, newsUrl, news);
  }
  // @MessagePattern('noticeNews')
  // noticeNews(newsTitle, msgContent = '哎哟，不错哦', newsUrl, news?: any): any {
  //   return this.pushService.noticeNews(newsTitle, msgContent, newsUrl, news);
  // }

  @EventPattern('notice')
  notice(serviceName, msgContent): any {
    return this.pushService.notice(serviceName, msgContent);
  }
}
