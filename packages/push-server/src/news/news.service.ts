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
   * 获取消息接口调用
   * @param latestTime
   * @returns
   */
  async fetchNews(latestTime) {
    let result = { data: { list: [] } };
    latestTime = latestTime
      ? latestTime
      : Math.round(new Date().getTime() / 1000).toString();
    try {
      result = await fetchNewsRequest(latestTime);
    } catch (error) {
      this.logger.error('[fetchNews] 获取新闻数据失败：' + error);
      return [];
    }
    return result?.data?.list;
  }

  /**
   * 过滤重要消息，并返回最新时间
   * @param list
   * @returns
   */
  importantNewsFilter(list, latestTime) {
    const needPushNews = [];

    // 取出重要消息进行推送
    list &&
      list.forEach((news, i) => {
        if (i === 0) {
          latestTime = news.ctime;
        }
        // color 为 '2'，重要消息
        if (news.color === '2') {
          needPushNews.push(news);
        }
      });

    return { newsList: needPushNews, latestTime };
  }

  /**
   * 获取同花顺新闻 - 定时任务需要
   * @returns {Promise<any>}
   */
  async fetchNewsTask() {
    this.tempLatestTime = this.latestTime;
    const list: any = await this.fetchNews(this.latestTime);
    this.logger.log(
      '[fetchNewsTask] 获取所有新闻: ' +
      this.latestTime +
      '，条数：' +
      list?.length,
    );
    const newsData = this.importantNewsFilter(list, this.latestTime);
    this.latestTime = newsData.latestTime;

    return newsData.newsList;
  }

  /**
   * 获取同花顺最新新闻
   * @returns {Promise<any>}
   */
  async fetchLatestNews(latestTime) {
    const list: any = await this.fetchNews(latestTime);
    this.logger.log(
      '[fetchLatestNews] 获取所有新闻: ' +
      latestTime +
      '，条数：' +
      list?.length,
    );
    return this.importantNewsFilter(list, latestTime);
  }

  /**
   * 推送消息失败，还原更新时间
   */
  reductionLatestTime() {
    this.latestTime = this.tempLatestTime;
    this.tempLatestTime = '';
  }
}
