import { Injectable, Logger } from '@nestjs/common';
import { SpecialStockDto } from '../dto/special-stock.dto';
import { Repository } from 'typeorm';
import { specialStock } from '../entities/specialStock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpectEnum } from '../utils/transformDataUtil';
import { getBiddingData } from '../utils/specialStockUtil';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
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

  // 竞价数据 - 早盘
  @Cron('08 25 9 * * 1-5')
  async autoCrawlBinddingData() {
    this.crawlBinddingData();
  }
  // 竞价数据 - 尾盘收盘价
  @Cron('00 05 15 * * 1-5')
  async autoCrawlBinddingDataLateSession() {
    this.crawlBinddingData();
  }

  async crawlBinddingData(isRemoveIncompatible = 0) {
    this.logger.debug('autoCrawlBinddingData is Begining!');

    let isExist = false;
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.getTodayData(todayDateStr);

    if (todayDataFromDB) {
      isExist = true;
    }
    let specialStockDto: SpecialStockDto = new SpecialStockDto();
    try {
      const yesterdayDateStr = await this.getLastTradingDayByDB(todayDateStr);

      // 获取竞价情况
      const { dailyLimitYesterdayBidding, newStocks, chooseStock1Expected } = await getBiddingData(todayDateStr, yesterdayDateStr);
      specialStockDto.biddingData = JSON.stringify(dailyLimitYesterdayBidding);
      specialStockDto.newStock = JSON.stringify(newStocks);
      specialStockDto.chooseStock = JSON.stringify({
        chooseStock1Expected
      });
      specialStockDto.updatedTime = new Date();

      // 处理不及预期个股
      this.dealIncompatibleExpectStocks(isRemoveIncompatible, dailyLimitYesterdayBidding);

      // console.log(specialStockDto);
      if (isExist) {
        this.logger.log('autoCrawlBinddingData 更新数据');
        await this.specialStockRp.update(todayDataFromDB.id, specialStockDto);
      } else {
        specialStockDto.createTime = new Date();
        this.logger.log('autoCrawlBinddingData 新增数据');
        await this.specialStockRp.save(specialStockDto);
      }

      this.logger.debug('autoCrawlBinddingData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }

    return specialStockDto;
  }


  /**
   * 处理不及预期个股
   * @returns 
   */
  async dealIncompatibleExpectStocks(isRemoveIncompatible, dailyLimitYesterdayBidding) {
    // 删除不及预期个股
    if (isRemoveIncompatible) {
      this.logger.log('dealIncompatibleExpectStocks 删除不及预期个股');
      const incompatibleExpectStocks = [];

      dailyLimitYesterdayBidding.forEach(stock => {
        // 将不及预期个股 加入数组
        if (stock.expected === ExpectEnum.incompatible) {
          incompatibleExpectStocks.push(stock);
        }
      });
      // 批量 剔除低于预期的昨日涨停个股（首板），集合竞价开盘价低于预期， 且成交量不足，未匹配量；
      this.thsService.batchUpdateThsSelfStock(incompatibleExpectStocks, ThsOprate.del);
    }
  }


  /**
   * 获取今天的数据
   * @param todayDateStr 
   * @returns 
   */
  getTodayData(todayDateStr: string) {
    return this.specialStockRp
      .createQueryBuilder('special_stock')
      .where("special_stock.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();
  }

  async findAll() {
    return await this.specialStockRp.find();
  }

  async findByLimit(len: number = 20) {
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
    let lastTradingDay = dayjs(dateArr[0].createTime).format(iWencaiDateFormat);
    if (lastTradingDay === currentDate) {
      lastTradingDay = dayjs(dateArr[1].createTime).format(iWencaiDateFormat);
    }

    return lastTradingDay;
  }
}
