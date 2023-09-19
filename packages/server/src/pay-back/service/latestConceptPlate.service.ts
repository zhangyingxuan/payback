import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { latestConceptPlate } from '../entities/latestConceptPlate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getLatestConceptPlate } from '../utils/latestConceptPlateUtil'
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LatestConceptPlateService {
  constructor(
    @InjectRepository(latestConceptPlate) private readonly latestConceptPlateRp: Repository<latestConceptPlate>
  ) { }

  private readonly logger = new Logger(LatestConceptPlateService.name);

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 00 16 * * 1-5')
  async crawlLatestConceptPlateData() {
    this.logger.debug('crawlLatestConceptPlateData is Begining!');
    const conceptPlate = await this.findLatestOne();
    let latestConceptPlates;
    try {
      // 爬取最新概念板块，若果有的话 则保存 近5日新增概念
      latestConceptPlates = await getLatestConceptPlate(conceptPlate);
      console.log(latestConceptPlates);
      if (latestConceptPlates) {
        latestConceptPlates.forEach(async (latestConceptPlate) => {
          await this.latestConceptPlateRp.save(latestConceptPlate);
        });
      }
      this.logger.debug('crawlLatestConceptPlateData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }
    // 深圳 还是 上海涨停的多 SZ. SH
    return latestConceptPlates;
  }

  async findAll() {
    return await this.latestConceptPlateRp.find();
  }
  /**
   * 获取 n 条 概念
   * @returns 
   */
  async findByLimit(len: number = 20) {
    return await this.latestConceptPlateRp.createQueryBuilder('latest_concept_plate')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }
  /**
   * 查找N天内的 概念
   * @returns 
   */
  async findWithinNDays(n: number = 15) {
    const nDaysAgo = new Date();
    nDaysAgo.setDate(nDaysAgo.getDate() - n);

    return await this.latestConceptPlateRp.createQueryBuilder('latest_concept_plate')
      .where('latest_concept_plate.createTime > :date', { date: nDaysAgo })
      .orderBy('createTime', 'DESC')
      .getMany();
  }
  /**
   * 查找最新的一条
   * @returns 
   */
  async findLatestOne() {
    return await this.latestConceptPlateRp.createQueryBuilder('latest_concept_plate')
      .offset(0)
      .limit(1)
      .orderBy('createTime', 'DESC')
      .getOne();
  }
}
