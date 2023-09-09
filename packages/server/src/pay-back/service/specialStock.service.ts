import { Injectable, Logger } from '@nestjs/common';
import { SpecialStockDto } from '../dto/special-stock.dto';
import { Repository } from 'typeorm';
import { specialStock } from '../entities/specialStock.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getBiddingData } from '../utils/specialStockUtil';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { iWencaiDateFormat } from 'pay-back-core';

@Injectable()
export class SpecialStockService {
  constructor(
    @InjectRepository(specialStock) private readonly specialStockRp: Repository<specialStock>,
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

  async crawlBinddingData() {
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
      const { dailyLimitYesterdayBiddingDtos, newStocksDtos, chooseStock1to2Dtos } = await getBiddingData(todayDateStr, yesterdayDateStr);
      specialStockDto.biddingData = JSON.stringify(dailyLimitYesterdayBiddingDtos);
      specialStockDto.newStock = JSON.stringify(newStocksDtos);
      specialStockDto.chooseStock = JSON.stringify({
        chooseStock1to2Dtos
      });

      console.log(specialStockDto);
      if (isExist) {
        this.logger.log('autoCrawlBinddingData 更新数据')
        await this.specialStockRp.update(todayDataFromDB.id, specialStockDto);
      } else {
        this.logger.log('autoCrawlBinddingData 新增数据')
        await this.specialStockRp.save(specialStockDto);
      }

      this.logger.debug('autoCrawlBinddingData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }

    return specialStockDto;
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
