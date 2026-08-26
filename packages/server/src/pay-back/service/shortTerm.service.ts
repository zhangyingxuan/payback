import { Injectable, Logger } from '@nestjs/common';
import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getShortTermData, mergeExtra2ShortTermData, getShortTermDataByDate } from '../utils/shortTermUtil';
import { ThsService } from './ths.service';
import * as dayjs from 'dayjs';
import { SpecialStockService } from './specialStock.service';
import { UsersService } from '@/users/users.service';
import { getIwencaiCookie } from '../utils/thsUtils';
import { toIwencaiDate, toTradeDate } from '../utils/tradeDateUtil';

@Injectable()
export class ShorTermService {
  constructor(
    private readonly thsService: ThsService,
    private readonly specialStockService: SpecialStockService,
    private readonly usersService: UsersService,
    @InjectRepository(shortTermData) private readonly shortTermDataRp: Repository<shortTermData>,
  ) {}

  private readonly logger = new Logger(ShorTermService.name);

  /**
   * 爬取短线数据，如果已存在则更新
   * @returns
   */
  async crawlShortTermData(account = 'admin') {
    this.logger.debug('crawlShortTermData is Begining!');
    const todayDateStr = toTradeDate();

    let createPayBackDto: CreatePayBackDto;
    try {
      const lastTradingDayData = await this.getLastTradingDayData(todayDateStr);
      const user = await this.usersService.getUserByAccount(account);
      const cookie = getIwencaiCookie(user);
      createPayBackDto = await getShortTermData(todayDateStr, lastTradingDayData, cookie);
      createPayBackDto.tradeDate = todayDateStr;

      // 如果存在数据，则返回已有该数据
      const todayDataFromDB = await this.getTodayData(todayDateStr);
      if (todayDataFromDB) {
        this.logger.log('crawlShortTermData 更新数据');
        await this.shortTermDataRp.update(todayDataFromDB.id, createPayBackDto);
      } else {
        this.logger.log('crawlShortTermData 新增数据');
        await this.shortTermDataRp.save(createPayBackDto);
      }

      this.logger.debug('crawlShortTermData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw e;
    }

    return createPayBackDto;
  }

  /**
   * 获取对应日期的数据
   * @param todayDateStr
   * @returns
   */
  async crawlShortTermDataByDate(todayDateStr, account = 'admin') {
    this.logger.debug('crawlShortTermDataByDate is Begining!');
    todayDateStr = toTradeDate(todayDateStr);
    let createPayBackDto: CreatePayBackDto;
    try {
      const lastTradingDayData = await this.getLastTradingDayData(todayDateStr);
      const cookie = getIwencaiCookie(await this.usersService.getUserByAccount(account));
      createPayBackDto = await getShortTermDataByDate(todayDateStr, lastTradingDayData, cookie);
      createPayBackDto.tradeDate = todayDateStr;
      const dateTime = new Date(todayDateStr);
      dateTime.setHours(15);
      dateTime.setMinutes(55);
      createPayBackDto.createTime = dateTime;

      const todayDataFromDB = await this.getTodayData(todayDateStr);
      // console.log(createPayBackDto);
      if (todayDataFromDB) {
        this.logger.log('crawlShortTermData 更新数据');
        await this.shortTermDataRp.update(todayDataFromDB.id, createPayBackDto);
      } else {
        this.logger.log('crawlShortTermData 新增数据');
        await this.shortTermDataRp.save(createPayBackDto);
      }

      this.logger.debug('crawlShortTermData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw e;
    }

    return createPayBackDto;
  }

  /**
   * 获取今天的数据
   * @param todayDateStr
   * @returns
   */
  getTodayData(todayDateStr: string) {
    return this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .where('short_term_data.tradeDate = :tradeDate', { tradeDate: toTradeDate(todayDateStr) })
      .orWhere('short_term_data.tradeDate IS NULL AND DATE(short_term_data.createTime) = :tradeDate', {
        tradeDate: toTradeDate(todayDateStr),
      })
      .getOne();
  }

  /**
   * 获取上一个交易日的数据
   * @param todayDateStr
   * @returns
   */
  async getLastTradingDayData(todayDateStr: string) {
    const currentDate = toIwencaiDate(todayDateStr);
    const dataList = await this.findByLimit(2);
    // 取出第一个不是今日的数据
    const lastTradingDayData = dataList.find(item => {
      return currentDate !== dayjs(item.createTime.toString()).format('YYYYMMDD');
    });

    // console.log(lastTradingDayData);
    return lastTradingDayData;
  }

  async findAll() {
    return await this.shortTermDataRp.find();
  }

  async findByLimit(len = 20) {
    return await this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .offset(0)
      .limit(len)
      .select([
        'short_term_data.dailyLimitQuantity',
        'short_term_data.tradeDate',
        'short_term_data.downLimitQuantity',
        'short_term_data.marketHeight',
        'short_term_data.evenBoardAmount',
        'short_term_data.createTime',
        'short_term_data.tradeDate',
      ])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  /**
   * 返回连板数据，用于短线详情
   * @param len
   * @returns
   */
  async findEvenBoardByLimit(len = 20) {
    // 1. 重新组装数据，将竞价数据，装入昨日涨停中
    const shortTermData = await this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .offset(0)
      .limit(len)
      .select([
        'short_term_data.createTime',
        'short_term_data.evenBoardAmount',
        'short_term_data.dailyLimitQuantity',
        'short_term_data.downLimitQuantity',
        'short_term_data.sealingRate',
        'short_term_data.dailyLimitReturnSealQuantity',
        'short_term_data.evenBoardData',
        'short_term_data.hugeFallData',
        'short_term_data.cycle',
        'short_term_data.downLimitData',
      ])
      .orderBy('createTime', 'DESC')
      .getMany();
    // 获取额外数据（新股、选股、昨日涨停竞价数据）
    const specialStocks = await this.specialStockService.findByLimit(len);
    // 组装竞价数据
    const shortTermDataResult = mergeExtra2ShortTermData(shortTermData, specialStocks);

    return shortTermDataResult;
  }

  async deleteByCreateTime(date) {
    return await this.shortTermDataRp
      .createQueryBuilder()
      .delete()
      .where('createTime like :date', { date: date + '%' })
      .execute();
  }
}
