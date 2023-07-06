import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from '../utils/playWrightUtil'
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(marketData) private readonly marketDataRp: Repository<marketData>
  ) { }

  private readonly logger = new Logger(MarketService.name);

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 15 15 * * 1-5')
  async crawlMarketData() {
    this.logger.debug('crawlMarketData is Begining!');
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.marketDataRp
      .createQueryBuilder('market_data')
      .where("market_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      this.logger.debug('crawlMarketData is end![isExist]!');
      return {
        code: 'isExist',
        msg: todayDateStr + ' 数据已存在！',
      }
    }
    let marketData: CreateMarketDataDto;
    try {
      marketData = await playWrightUtil.getMarketData(dayjs(todayDateStr).format('YYYYMMDD'));
      console.log(marketData);
      await this.marketDataRp.save(marketData);
      this.logger.debug('crawlMarketData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }
    return marketData;
  }

  async findAll() {
    return await this.marketDataRp.find();
  }
  async findByLimit(len: number = 20) {
    return await this.marketDataRp
      .createQueryBuilder('market_data')
      .offset(0)
      .limit(len)
      .select([
        'market_data.createTime',
        'market_data.marketScore',
        'market_data.riseAmount',
        'market_data.fallAmount',
        'market_data.dailyLimitIncome',
        'market_data.shangzhengPoint',
        'market_data.shenzhengPoint',
        'market_data.chuangyePoint',
        'market_data.beizheng50Point'])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  /**
   * 获取涨跌幅TOP5板块 根据len 长度
   * @param len 
   * @returns 
   */
  async findPlateByLimit(len: number = 20) {
    return await this.marketDataRp
      .createQueryBuilder('market_data')
      .offset(0)
      .limit(len)
      .select([
        'market_data.createTime',
        'market_data.gainianRiseFloat',
        'market_data.gainianFallFloat',
        'market_data.hangyeRiseFloat',
        'market_data.hangyeFallFloat'])
      .orderBy('createTime', 'DESC')
      .getMany();
  }
}
