import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { marketData } from './entities/marketData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from './utils/playWrightUtil'
import { marketUrl } from './utils/config';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { CreateMarketDataDto } from './dto/create-market-data.dto';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(marketData) private readonly marketDataRp: Repository<marketData>
  ) { }

  private readonly logger = new Logger(MarketService.name);

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 0 16 * * 1-5')
  async crawlMarketData() {
    this.logger.debug('crawlMarketData is Begining!');
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.marketDataRp
      .createQueryBuilder('market_data')
      .where("market_data.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      return {
        code: 'isExist',
        msg: todayDateStr + ' 数据已存在！',
      }
    }

    const marketData: CreateMarketDataDto = await playWrightUtil.getMarketData(marketUrl, '/api.php');
    await this.marketDataRp.save(marketData);
    this.logger.debug('Called is success!');
    // 深圳 还是 上海涨停的多 SZ. SH
    return marketData;
  }

  async findAll() {
    return await this.marketDataRp.find();
  }
  async findByLimit(len: number = 20) {
    return await this.marketDataRp
      .createQueryBuilder('short_term_data')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'ASC')
      .getMany();
  }
}
