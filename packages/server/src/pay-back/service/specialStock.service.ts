import { Injectable, Logger } from '@nestjs/common';
import { SpecialStockDto } from '../dto/special-stock.dto';
import { Repository } from 'typeorm';
import { specialStock } from '../entities/specialStock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpectEnum } from '../utils/transformDataUtil';
import { fetchLastdayDailyLimitBinddingData, fetchSpecialStockBinddingData } from '../utils/specialStockUtil';
import * as dayjs from 'dayjs';
import { iWencaiDateFormat } from 'pay-back-core';
import { ThsService } from './ths.service';
import { ThsOprate } from '../core/fetchUtil';

@Injectable()
export class SpecialStockService {
  constructor(
    @InjectRepository(specialStock) private readonly specialStockRp: Repository<specialStock>,
    private readonly thsService: ThsService,
  ) { }

  private readonly logger = new Logger(SpecialStockService.name);

  // 竞价数据 - 午盘
  // @Cron('00 35 11 * * 1-5')
  // async autoCrawlBinddingDataMidday() {
  //   this.crawlBinddingData(0, 'admin');
  // }
  // // 竞价数据 - 尾盘收盘价
  // @Cron('00 05 15 * * 1-5')
  // async autoCrawlBinddingDataLateSession() {
  //   this.crawlBinddingData(0, 'admin');
  // }

  /**
   * 爬取当日竞价数据并返回
   */
  async crawlBinddingData(isRemoveIncompatible = 0, account) {
    this.logger.debug('crawlBinddingData is Begining!');

    const todayDateStr = new Date().toLocaleDateString();
    let todayDataFromDB: any = null;
    const specialStockDto: SpecialStockDto = {
      biddingData: '',
      newStock: '',
      chooseStock: '',
      fundsLikeStock: '',
      // 近1个月涨幅最高的个股Top3
      heightestStock: '',
      // 创建时间
      createTime: new Date(),
      // 更新时间
      updatedTime: new Date(),
    };
    try {
      // 获取最新的交易日期
      const yesterdayDateStr = await this.getLastTradingDayByDB(todayDateStr);

      // 获取竞价情况
      const dailyLimitYesterdayBidding = await fetchLastdayDailyLimitBinddingData(todayDateStr, yesterdayDateStr);
      // 处理不及预期个股
      isRemoveIncompatible && this.dealIncompatibleExpectStocks(dailyLimitYesterdayBidding, account);

      // 如果存在数据
      todayDataFromDB = await this.getTodayData(todayDateStr);
      if (todayDataFromDB) {
        todayDataFromDB.biddingData = JSON.stringify(dailyLimitYesterdayBidding);
        todayDataFromDB.updatedTime = new Date();
        this.logger.log('crawlBinddingData 更新数据');
        await this.specialStockRp.update(todayDataFromDB.id, todayDataFromDB);
      } else {
        specialStockDto.biddingData = JSON.stringify(dailyLimitYesterdayBidding);
        specialStockDto.updatedTime = new Date();
        specialStockDto.createTime = new Date();
        this.logger.log('crawlBinddingData 新增数据');
        await this.specialStockRp.save(specialStockDto);
      }
      this.logger.debug('crawlBinddingData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw new Error(e);
    }

    return todayDataFromDB ? todayDataFromDB : specialStockDto;
  }

  /**
   * 爬取特殊个股数据并返回
   */
  async crawlSpecialStockData() {
    this.logger.debug('crawlSpecialStockData is Begining!');

    let todayDataFromDB: any = null;
    const todayDateStr = new Date().toLocaleDateString();
    const specialStockDto: SpecialStockDto = {
      biddingData: '',
      newStock: '',
      chooseStock: '',
      fundsLikeStock: '',
      // 近1个月涨幅最高的个股Top3
      heightestStock: '',
      // 创建时间
      createTime: new Date(),
      // 更新时间
      updatedTime: new Date(),
    };
    try {
      // 获取最新的交易日期
      const yesterdayDateStr = await this.getLastTradingDayByDB(todayDateStr);

      // 获取竞价情况
      const { newStocks, chooseStock1Expected } = await fetchSpecialStockBinddingData(todayDateStr, yesterdayDateStr);

      // 如果存在数据
      todayDataFromDB = await this.getTodayData(todayDateStr);
      if (todayDataFromDB) {
        // 更新
        todayDataFromDB.newStock = JSON.stringify(newStocks);
        todayDataFromDB.chooseStock = JSON.stringify({ chooseStock1Expected });
        todayDataFromDB.updatedTime = new Date();
        this.logger.log('crawlSpecialStockData 更新数据');
        await this.specialStockRp.update(todayDataFromDB.id, todayDataFromDB);
      } else {
        // 新增
        specialStockDto.newStock = JSON.stringify(newStocks);
        specialStockDto.chooseStock = JSON.stringify({ chooseStock1Expected });
        specialStockDto.updatedTime = new Date();
        specialStockDto.createTime = new Date();
        this.logger.log('crawlSpecialStockData 新增数据');
        await this.specialStockRp.save(specialStockDto);
      }
      this.logger.debug('crawlSpecialStockData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw new Error(e);
    }

    return todayDataFromDB ? todayDataFromDB : specialStockDto;
  }

  /**
   * 处理不及预期个股
   * @returns
   */
  async dealIncompatibleExpectStocks(dailyLimitYesterdayBidding, account) {
    // 删除不及预期个股
    this.logger.log('dealIncompatibleExpectStocks 删除不及预期个股');
    const incompatibleExpectStocks = [];

    dailyLimitYesterdayBidding &&
      dailyLimitYesterdayBidding.forEach(stock => {
        if (stock.expected === ExpectEnum.incompatible) {
          incompatibleExpectStocks.push(stock);
        }
      });
    // 批量 剔除低于预期的昨日涨停个股（首板），集合竞价开盘价低于预期， 且成交量不足，未匹配量；
    incompatibleExpectStocks.length > 0 &&
      this.thsService.batchUpdateThsSelfStock(incompatibleExpectStocks, ThsOprate.del, account);
  }

  /**
   * 获取今天的数据
   * @param todayDateStr
   * @returns
   */
  getTodayData(todayDateStr: string) {
    return this.specialStockRp
      .createQueryBuilder('special_stock')
      .where('special_stock.createTime like :createTime', {
        createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%',
      })
      .getOne();
  }

  async findAll() {
    return await this.specialStockRp.find();
  }

  async findByLimit(len = 20) {
    return await this.specialStockRp
      .createQueryBuilder('special_stock')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  /**
   * 获取数据库中 上一个交易日的日期
   * @param todayDateStr
   */
  async getLastTradingDayByDB(todayDateStr) {
    const dateArr: any = await this.specialStockRp
      .createQueryBuilder('special_stock')
      .offset(0)
      .limit(2)
      .select(['special_stock.createTime'])
      .orderBy('createTime', 'DESC')
      .getMany();


    const currentDate = dayjs(todayDateStr).format(iWencaiDateFormat);
    let lastTradingDay = dayjs(dateArr[0]?.createTime).format(iWencaiDateFormat);
    if (lastTradingDay === currentDate) {
      lastTradingDay = dayjs(dateArr[1]?.createTime).format(iWencaiDateFormat);
    }

    return lastTradingDay;
  }

  async deleteByCreateTime(date) {
    return await this.specialStockRp
      .createQueryBuilder()
      .delete()
      .where('createTime like :date', { date: date + '%' })
      .execute();
  }
}
