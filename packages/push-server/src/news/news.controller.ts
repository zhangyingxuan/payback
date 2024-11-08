import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { NewsService } from './news.service';
import { PushService } from '../push/push.service';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly pushService: PushService,
  ) { }
  private readonly logger = new Logger(NewsController.name);

  @EventPattern('fetchNewsTask')
  async fetchNewsTask() {
    const newsList: any = await this.newsService.fetchNewsTask();
    newsList.forEach((news) => {
      try {
        // 推送消息
        this.pushService.noticeNews(news.title, news.digest, news.url, news);
      } catch (e) {
        this.logger.log('[fetchNewsTask] 推送消息失败：' + e);
        // 推送失败，还原查询时间
        this.newsService.reductionLatestTime();
      }
    });
  }

  @MessagePattern('fetchLatestNews')
  async fetchLatestNews(@Payload() payload: any) {
    const newsData: any = await this.newsService.fetchLatestNews(payload);
    return {
      code: 0,
      data: newsData,
    };
  }
}
