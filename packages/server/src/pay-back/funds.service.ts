import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { fundsData } from './entities/fundsData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from './utils/playWrightUtil'
import { CreateFundsDataDto } from './dto/create-funds-data.dto';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(fundsData) private readonly fundsDataRp: Repository<fundsData>
  ) { }

  private readonly logger = new Logger(FundsService.name);

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 30 15 * * 1-5')
  async crawlfundsData() {
    this.logger.debug('crawlfundsData is Begining!');
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.fundsDataRp
      .createQueryBuilder('market_data')
      .where("market_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      this.logger.debug('crawlfundsData is isExist!');
      // return {
      //   code: 'isExist',
      //   msg: todayDateStr + ' 数据已存在！',
      // }
    }
    let fundsData: CreateFundsDataDto;
    try {
      fundsData = await playWrightUtil.getFundsData(dayjs(todayDateStr).format('YYYYMMDD'));
      await this.fundsDataRp.save(fundsData);
      this.logger.debug('crawlfundsData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }
    // 深圳 还是 上海涨停的多 SZ. SH
    return fundsData;
  }

  async findAll() {
    return await this.fundsDataRp.find();
  }
  async findByLimit(len: number = 20) {
    return await this.fundsDataRp
      .createQueryBuilder('short_term_data')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }
}
