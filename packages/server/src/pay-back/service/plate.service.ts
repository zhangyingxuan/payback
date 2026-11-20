import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { plateData } from '../entities/plateData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import plateUtil from '../utils/plateUtil';
import { CreatePlateDataDto } from '../dto/create-plate-data.dto';
import { toIwencaiDate, toTradeDate } from '../utils/tradeDateUtil';

@Injectable()
export class PlateService {
  constructor(@InjectRepository(plateData) private readonly plateDataRp: Repository<plateData>) {}

  private readonly logger = new Logger(PlateService.name);

  // @Cron('0 15 15 * * 1-5')
  // async autoCrawlPlateDataLatePm() {
  //   this.crawlPlateData();
  // }

  // // 午盘
  // @Cron('0 33 11 * * 1-5')
  // async autoCrawlPlateDataMidday() {
  //   this.crawlPlateData();
  // }

  async crawlPlateData() {
    this.logger.debug('crawlPlateData is Begining!');
    const todayDateStr = toTradeDate();

    let plateData: CreatePlateDataDto;
    try {
      plateData = await plateUtil.getPlateData(toIwencaiDate(todayDateStr));
      plateData.tradeDate = todayDateStr;
      // console.log(plateData);

      // 兼容尚未补齐交易日期的历史行，避免同一天出现两份快照。
      const todayDataFromDB = await this.plateDataRp
        .createQueryBuilder('plate_data')
        .where('plate_data.tradeDate = :tradeDate', { tradeDate: todayDateStr })
        .orWhere('plate_data.tradeDate IS NULL AND DATE(plate_data.createTime) = :tradeDate', {
          tradeDate: todayDateStr,
        })
        .orderBy('plate_data.tradeDate', 'DESC')
        .addOrderBy('plate_data.id', 'DESC')
        .getOne();
      if (todayDataFromDB && !todayDataFromDB.tradeDate) {
        await this.plateDataRp.save({ ...plateData, id: todayDataFromDB.id });
      } else {
        // 利用交易日期唯一索引合并并发写入，写入完成后再返回榜单。
        await this.plateDataRp.upsert(plateData, ['tradeDate']);
      }

      this.logger.debug('crawlPlateData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw e;
    }

    return plateData;
  }

  async findAll() {
    return await this.plateDataRp.find();
  }
  async findByLimit(len = 20) {
    return await this.plateDataRp
      .createQueryBuilder('plate_data')
      .offset(0)
      .limit(len)
      .select([
        'plate_data.tradeDate',
        'plate_data.createTime',
        'plate_data.gainianDailyLimitData',
        'plate_data.gainianDailyLimitNum',
        'plate_data.hangyeDailyLimitData',
        'plate_data.hangyeDailyLimitNum',
      ])
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  async deleteByCreateTime(date) {
    return await this.plateDataRp
      .createQueryBuilder()
      .delete()
      .where('createTime like :date', { date: date + '%' })
      .execute();
  }
}
