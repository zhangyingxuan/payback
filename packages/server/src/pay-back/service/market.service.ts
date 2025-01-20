import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import marketUtil from '../utils/marketUtil';
import * as dayjs from 'dayjs';
import { CreateMarketDataDto } from '../dto/create-market-data.dto';

@Injectable()
export class MarketService {
  constructor(@InjectRepository(marketData) private readonly marketDataRp: Repository<marketData>) { }

  private readonly logger = new Logger(MarketService.name);

  // @Cron('0 10 15 * * 1-5')
  // async autoCrawlMarketDataPm() {
  //   this.crawlMarketData();
  // }

  // // 午盘
  // @Cron('0 31 11 * * 1-5')
  // async autoCrawlMarketDataMidday() {
  //   this.crawlMarketData();
  // }

  async crawlMarketData() {
    this.logger.debug('crawlMarketData is Begining!');
    const todayDateStr = new Date().toLocaleDateString();

    let marketData: CreateMarketDataDto;
    try {
      marketData = await marketUtil.getMarketData(dayjs(todayDateStr).format('YYYYMMDD'));

      // 如果存在数据，则返回已有该数据
      const todayDataFromDB = await this.marketDataRp
        .createQueryBuilder('market_data')
        .where('market_data.createTime like :createTime', {
          createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%',
        })
        .getOne();
      if (todayDataFromDB) {
        this.logger.log('crawlMarketData 更新数据');
        await this.marketDataRp.update(todayDataFromDB.id, marketData);
      } else {
        this.logger.log('crawlMarketData 新增数据');
        await this.marketDataRp.save(marketData);
      }

      this.logger.debug('crawlMarketData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw new Error(e);
    }

    return marketData;
  }

  async findAll() {
    return await this.marketDataRp.find();
  }
  async findByLimit(len = 20) {
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
        'market_data.shangzhengRiseAndFall',
        'market_data.marketTurnover',
        'market_data.shangzhengPoint',
        'market_data.shenzhengPoint',
        'market_data.chuangyePoint',
        'market_data.beizheng50Point',
      ])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  /**
   * 获取涨跌幅TOP5板块 根据len 长度
   * @param len
   * @returns
   */
  async findPlateByLimit(len = 20) {
    return await this.marketDataRp
      .createQueryBuilder('market_data')
      .offset(0)
      .limit(len)
      .select([
        'market_data.createTime',
        'market_data.gainianRiseFloat',
        'market_data.gainianFallFloat',
        'market_data.hangyeRiseFloat',
        'market_data.hangyeFallFloat',
      ])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  async deleteByCreateTime(date) {
    return await this.marketDataRp
      .createQueryBuilder()
      .delete()
      .where('createTime like :date', { date: date + '%' })
      .execute();
  }
}
