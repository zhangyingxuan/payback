import { Injectable, Logger } from '@nestjs/common';
import { CreatePayBackDto } from './dto/create-pay-back.dto';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from './entities/shortTermData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from './utils/playWrightUtil'
import { params, iwencaiUrl } from './utils/config';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PayBackService {
  constructor(
    @InjectRepository(shortTermData) private readonly shortTermDataRp: Repository<shortTermData>,
  ) { }

  private readonly logger = new Logger(PayBackService.name);

  // * * * * * *：每一秒 分钟 小时 日 月份 周（星期） 年份
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 0 17 * * 1-5')
  async crawlTodayData() {
    this.logger.debug('crawlTodayData is Begining!');
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.shortTermDataRp
      .createQueryBuilder('short_term_data')
      .where("short_term_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      this.logger.debug('crawlTodayData is end![isExist]');
      return {
        code: 'isExist',
        msg: todayDateStr + ' 数据已存在！',
      }
    }

    let createPayBackDto: CreatePayBackDto = new CreatePayBackDto();
    // 准备涨停数据
    const dailyLimitData: Object[] = await playWrightUtil.getShortTermData(iwencaiUrl + params.dailyLimitMoreThan1, 'chart/get-robot-data');
    // 跌停数据
    const downLimitData: Object[] = await playWrightUtil.getShortTermData(iwencaiUrl + params.downLimit, 'chart/get-robot-data');
    // console.log(dailyLimitData);
    // console.log(downLimitData);

    const currentDate = dayjs(todayDateStr).format('YYYYMMDD');
    const evenBoardLabel = `连续涨停天数[${currentDate}]`;
    // const currentDate = dayjs(new Date().toLocaleTimeString()).format('YYYYMMDD')
    createPayBackDto.createTime = new Date();
    createPayBackDto.downLimitQuantity = downLimitData.length;
    createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
    createPayBackDto.marketHeight = dailyLimitData[0][evenBoardLabel];

    let SZAmount = 0, SHAmount = 0, board1 = 0;
    dailyLimitData.forEach(item => {
      if (item[evenBoardLabel] === 1) {
        board1++;
      }
      // 连板的数据
      if (item['股票代码'].includes('SZ')) {
        SZAmount++;
      } else {
        SHAmount++;
      }
    });
    createPayBackDto.board1 = dailyLimitData.length - board1;
    createPayBackDto.evenBoard = board1;
    createPayBackDto.SZAmount = SZAmount;
    createPayBackDto.SHAmount = SHAmount;
    // console.log(createPayBackDto)
    await this.shortTermDataRp.save(createPayBackDto)
    this.logger.debug('Called is success!');
    // 深圳 还是 上海涨停的多 SZ. SH
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
      .orderBy('createTime', 'ASC')
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
