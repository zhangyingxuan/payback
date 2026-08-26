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

      // 如果存在数据，则返回已有该数据
      const todayDataFromDB = await this.plateDataRp
        .createQueryBuilder('plate_data')
        .where('plate_data.tradeDate = :tradeDate', { tradeDate: todayDateStr })
        .orWhere('plate_data.tradeDate IS NULL AND DATE(plate_data.createTime) = :tradeDate', {
          tradeDate: todayDateStr,
        })
        .getOne();
      if (todayDataFromDB) {
        this.logger.log('crawlPlateData 更新数据');
        // 优化 api 响应，去除 await 先返回再存储
        this.plateDataRp.update(todayDataFromDB.id, plateData);
      } else {
        this.logger.log('crawlPlateData 新增数据');
        // 优化 api 响应，去除 await 先返回再存储
        this.plateDataRp.save(plateData);
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
