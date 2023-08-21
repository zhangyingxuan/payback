import { Injectable, Logger } from '@nestjs/common';
import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { UpdatePayBackDto } from '../dto/update-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getShortTermData, getShortTermDataByDate } from '../utils/shortTermUtil';
import { ThsService } from './ths.service';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { getCurrentCycle } from 'pay-back-core';

@Injectable()
export class ShorTermService {
  constructor(
    private readonly thsService: ThsService,
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
    process.env.NODE_ENV !== 'dev' && this.thsService.modifyThsSelfStocks(JSON.parse(result.evenBoardData));
  }

  // 午盘
  @Cron('0 36 11 * * 1-5')
  async autoCrawlShortTermDataMidday() {
    this.crawlShortTermData();
  }

  /**
   * 爬取短线数据，如果已存在则更新
   * @returns 
   */
  async crawlShortTermData() {
    this.logger.debug('crawlShortTermData is Begining!');
    let isExist = false;
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .where("short_term_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      isExist = true;
    }
    let createPayBackDto: CreatePayBackDto;
    try {
      createPayBackDto = await getShortTermData(todayDateStr);

      console.log(createPayBackDto);
      if (isExist) {
        this.logger.log('crawlShortTermData 更新数据')
        await this.shortTermDataRp.update(todayDataFromDB.id, createPayBackDto);
      } else {
        this.logger.log('crawlShortTermData 新增数据')
        await this.shortTermDataRp.save(createPayBackDto);
      }

      this.logger.debug('crawlShortTermData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }

    return createPayBackDto;
  }

  async crawlShortTermDataByDate(todayDateStr) {
    this.logger.debug('crawlShortTermDataByDate is Begining!');
    const todayDataFromDB = await this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .where("short_term_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      this.logger.debug('crawlShortTermData is end![isExist]');
      return {
        code: 'isExist',
        msg: todayDateStr + ' 数据已存在！',
      }
    }

    let createPayBackDto: CreatePayBackDto;
    try {
      createPayBackDto = await getShortTermDataByDate(todayDateStr);
      console.log(createPayBackDto);
      await this.shortTermDataRp.save(createPayBackDto);
      this.logger.debug('crawlShortTermDataByDate is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }

    return createPayBackDto;
  }

  async findAll() {
    return await this.shortTermDataRp.find();
  }

  async findByLimit(len: number = 20) {
    return await this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .offset(0)
      .limit(len)
      .select(['short_term_data.dailyLimitQuantity',
        'short_term_data.downLimitQuantity',
        'short_term_data.marketHeight',
        'short_term_data.evenBoardAmount',
        'short_term_data.createTime'])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  async findEvenBoardByLimit(len: number = 20) {
    return await this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .offset(0)
      .limit(len)
      .select(['short_term_data.createTime',
        'short_term_data.evenBoardAmount',
        'short_term_data.dailyLimitQuantity',
        'short_term_data.downLimitQuantity',
        'short_term_data.sealingRate',
        'short_term_data.dailyLimitReturnSealQuantity',
        'short_term_data.evenBoardData',
        'short_term_data.hugeFallData',
        'short_term_data.cycle',
        'short_term_data.downLimitData'])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  async update(id: number, updatePayBackDto: UpdatePayBackDto) {
    return await this.shortTermDataRp.update(id, updatePayBackDto);
  }
}
