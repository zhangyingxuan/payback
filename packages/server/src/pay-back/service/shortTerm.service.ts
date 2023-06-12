import { Injectable, Logger } from '@nestjs/common';
import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { UpdatePayBackDto } from '../dto/update-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from '../utils/playWrightUtil';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ShorTermService {
  constructor(
    @InjectRepository(shortTermData) private readonly shortTermDataRp: Repository<shortTermData>,
  ) { }

  private readonly logger = new Logger(ShorTermService.name);

  // * * * * * *：每一秒 分钟 小时 日 月份 周（星期） 年份
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 0 17 * * 1-5')
  async crawlShortTermData() {
    this.logger.debug('crawlShortTermData is Begining!');
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
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
      createPayBackDto = await playWrightUtil.getShortTermData(todayDateStr);
      console.log(createPayBackDto)
      await this.shortTermDataRp.save(createPayBackDto)
      this.logger.debug('Called is success!');
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
      .select(['short_term_data.createTime', 'short_term_data.evenBoardData'])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  async findOne(id: number) {
    return `This action findOne a #${id} payBack`;
    // return await this.shortTermDataRp.findOne({ id });
  }

  async update(id: number, updatePayBackDto: UpdatePayBackDto) {
    return await this.shortTermDataRp.update(id, updatePayBackDto);
  }

  async remove(id: number) {
    // const currentOne = await this.shortTermDataRp.findOne({ id })
    // return await this.shortTermDataRp.remove(currentOne);
    return `This action removes a #${id} payBack`;
  }
}
