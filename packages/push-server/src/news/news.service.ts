import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { fetchNewsRequest } from './utils/fetchUtil';

@Injectable()
export class NewsService {
  public latestTime: string = Math.round(
    new Date().getTime() / 1000,
  ).toString();

  public tempLatestTime = '';
  private readonly logger = new Logger(NewsService.name);

  /**
   * 获取同花顺新闻
   * @returns {Promise<any>}
   */
  async fetchNews() {
    const result = await fetchNewsRequest(this.latestTime);
    const list = result?.data?.list;
    const needPushNews = [];
    this.logger.log(
      '[fetchNewsTask] 获取新闻数据: ' +
      this.latestTime +
      '，条数：' +
      list?.length,
    );
    this.tempLatestTime = this.latestTime;
    // this.logger.log('[fetchNewsTask] 获取新闻数据 list', list);
    // 取出重要消息进行推送
    list &&
      list.forEach((news, i) => {
        if (i === 0) {
          this.latestTime = news.ctime;
        }
        // color 为 '2'
        if (news.color === '2') {
          needPushNews.push(news);
        }
      });

    return needPushNews;
  }

  /**
   * 推送消息失败，还原更新时间
   */
  reductionLatestTime() {
    this.latestTime = this.tempLatestTime;
    this.tempLatestTime = '';
  }
}
