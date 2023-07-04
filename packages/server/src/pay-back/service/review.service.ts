import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { reviewData } from '../entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from '../utils/playWrightUtil'
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';

// 复盘梳理总结

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(reviewData) private readonly reviewDataRp: Repository<reviewData>
  ) { }

  private readonly logger = new Logger(ReviewService.name);

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  // @Cron('0 0 16 * * 1-5')
  async updateTodayReviewData() {
    this.logger.debug('updateTodayReviewData is Begining!');
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.reviewDataRp
      .createQueryBuilder('market_data')
      .where("market_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      this.logger.debug('updateTodayReviewData is end![isExist]!');
      return {
        code: 'isExist',
        msg: todayDateStr + ' 数据已存在！',
      }
    }
    let marketData: CreateMarketDataDto;
    try {
      marketData = await playWrightUtil.getMarketData(dayjs(todayDateStr).format('YYYYMMDD'));
      console.log(marketData);
      await this.reviewDataRp.save(marketData);
      this.logger.debug('updateTodayReviewData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }
    // 深圳 还是 上海涨停的多 SZ. SH
    return marketData;
  }

  async findAll() {
    return await this.reviewDataRp.find();
  }
  async findByLimit(len: number = 20) {
    return await this.reviewDataRp
      .createQueryBuilder('market_data')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }
  async findByDate(date: string) {
    return await this.reviewDataRp
      .createQueryBuilder('market_data')
      .offset(0)
      .where("market_data.createTime like :createTime", { createTime: dayjs(date).format('YYYY-MM-DD') + '%' })
      .orderBy('createTime', 'DESC')
      .getOne();
  }
}