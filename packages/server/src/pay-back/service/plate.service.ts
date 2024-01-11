import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { plateData } from '../entities/plateData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import plateUtil from '../utils/plateUtil';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';
import { CreatePlateDataDto } from '../dto/create-plate-data.dto';

@Injectable()
export class PlateService {
  constructor(@InjectRepository(plateData) private readonly plateDataRp: Repository<plateData>) {}

  private readonly logger = new Logger(PlateService.name);

  @Cron('0 15 15 * * 1-5')
  async autoCrawlPlateDataLateSession() {
    this.crawlPlateData();
  }

  // 午盘
  @Cron('0 33 11 * * 1-5')
  async autoCrawlPlateDataMidday() {
    this.crawlPlateData();
  }

  async crawlPlateData() {
    this.logger.debug('crawlPlateData is Begining!');
    let isExist = false;
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.plateDataRp
      .createQueryBuilder('plate_data')
      .where('plate_data.createTime like :createTime', { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      isExist = true;
    }
    let plateData: CreatePlateDataDto;
    try {
      plateData = await plateUtil.getPlateData(dayjs(todayDateStr).format('YYYYMMDD'));
      // console.log(plateData);
      if (isExist) {
        this.logger.log('crawlPlateData 更新数据');
        await this.plateDataRp.update(todayDataFromDB.id, plateData);
      } else {
        this.logger.log('crawlPlateData 新增数据');
        await this.plateDataRp.save(plateData);
      }

      this.logger.debug('crawlPlateData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      // this.logger.debug('crawlPlateData retry！playWrightUtil.getplateData');
      // plateData = await playWrightUtil.getplateData(dayjs(todayDateStr).format('YYYYMMDD'));
      // console.log(plateData);
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
        'plate_data.createTime',
        'plate_data.gainianDailyLimitData',
        'plate_data.gainianDailyLimitNum',
        'plate_data.hangyeDailyLimitData',
        'plate_data.hangyeDailyLimitNum',
      ])
      .orderBy('createTime', 'DESC')
      .getMany();
  }
}
