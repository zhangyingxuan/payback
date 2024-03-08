import { Injectable, Logger } from '@nestjs/common';
import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getShortTermData, mergeExtra2ShortTermData, getShortTermDataByDate } from '../utils/shortTermUtil';
import { ThsService } from './ths.service';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { SpecialStockService } from './specialStock.service';

@Injectable()
export class ShorTermService {
  constructor(
    private readonly thsService: ThsService,
    private readonly specialStockService: SpecialStockService,
    @InjectRepository(shortTermData) private readonly shortTermDataRp: Repository<shortTermData>,
  ) { }

  private readonly logger = new Logger(ShorTermService.name);

  // * * * * * *：每一秒 分钟 小时 日 月份 周（星期） 年份
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 20 15 * * 1-5')
  async autoCrawlShortTermDataLateSession() {
    const result = await this.crawlShortTermData();
    // 读取配置中是否加入自选
    process.env.NODE_ENV !== 'dev' &&
      this.thsService.autoModifyThsSelfStocks(JSON.parse(result.evenBoardData), 'admin');
  }

  // 午盘
  @Cron('0 36 11 * * 1-5')
  async autoCrawlShortTermDataMidday() {
    this.crawlShortTermData();
  }

  // 午盘
  @Cron('02 25 9 * * 1-5')
  async autoCrawlShortTermDataMorning() {
    this.crawlShortTermData();
  }

  /**
   * 爬取短线数据，如果已存在则更新
   * @returns
   */
  async crawlShortTermData() {
    this.logger.debug('crawlShortTermData is Begining!');
    const todayDateStr = new Date().toLocaleDateString();

    let createPayBackDto: CreatePayBackDto;
    try {
      createPayBackDto = await getShortTermData(todayDateStr);

      // console.log(createPayBackDto);
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
    }

    return createPayBackDto;
  }

  /**
   * 获取对应日期的数据
   * @param todayDateStr
   * @returns
   */
  async crawlShortTermDataByDate(todayDateStr) {
    this.logger.debug('crawlShortTermDataByDate is Begining!');
    let createPayBackDto: CreatePayBackDto;
    try {
      createPayBackDto = await getShortTermDataByDate(todayDateStr);
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
      .where('short_term_data.createTime like :createTime', {
        createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%',
      })
      .getOne();
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
        'short_term_data.downLimitQuantity',
        'short_term_data.marketHeight',
        'short_term_data.evenBoardAmount',
        'short_term_data.createTime',
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

    const shortTermDataResult = mergeExtra2ShortTermData(shortTermData, specialStocks);

    return shortTermDataResult;
  }
}
