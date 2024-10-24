import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
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

  @MessagePattern('fetchNewsTask')
  async fetchNewsTask() {
    const newsArr: Array<any> = await this.newsService.fetchNews();
    newsArr.forEach((news) => {
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
}
