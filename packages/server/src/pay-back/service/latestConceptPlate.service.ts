import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { marketData } from '../entities/marketData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from '../utils/playWrightUtil'
import { Cron } from '@nestjs/schedule';

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
    let latestConceptPlate;
    try {
      // 爬取最新概念板块，若果有的话 则保存 近5日新增概念
      latestConceptPlate = await playWrightUtil.getLatestConceptPlate(1);
      if (latestConceptPlate) {
        console.log(latestConceptPlate);
      }
      await this.marketDataRp.save(latestConceptPlate);
      this.logger.debug('crawlMarketData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }
    // 深圳 还是 上海涨停的多 SZ. SH
    return latestConceptPlate;
  }

  async findAll() {
    return await this.marketDataRp.find();
  }
}
