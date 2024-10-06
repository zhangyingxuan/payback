import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { getHotListData } from '../utils/hotListUtil';
import { CreateHotListDto } from '../dto/create-hot-list.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class HotListService {
  constructor(@InjectRepository(hotList) private readonly hotListRp: Repository<hotList>) { }

  private readonly logger = new Logger(HotListService.name);

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // @Cron('0 30 */1 * * *') // 每小时执行一次，30分钟开始
  // @Cron('0 */30 7-23 * * *') // 每小时执行一次，30分钟开始
  async crawlHotListData() {
    this.logger.debug('crawlHotListData is Begining!');
    const todayDateStr = new Date().toLocaleDateString();
    let hotListData: CreateHotListDto;
    try {
      hotListData = await getHotListData();
      const hotListData4Db: CreateHotListDto = {
        stockNormal: JSON.stringify(hotListData.stockNormal),
        stockValue: JSON.stringify(hotListData.stockValue),
        plateConcept: JSON.stringify(hotListData.plateConcept),
        plateIndustry: JSON.stringify(hotListData.plateIndustry),
        updatedTime: hotListData.updatedTime,
        createTime: hotListData.updatedTime,
      };

      // 如果存在数据，则返回已有该数据
      const todayDataFromDB = await this.hotListRp
        .createQueryBuilder('hot_list')
        .where('hot_list.createTime like :createTime', { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
        .getOne();

      if (todayDataFromDB) {
        this.logger.log('更新数据, id=' + todayDataFromDB.id);
        delete hotListData4Db.createTime;
        // 优化 api 响应，去除 await 先返回再存储
        await this.hotListRp.update(todayDataFromDB.id, hotListData4Db);
      } else {
        this.logger.log('新增数据');
        // 优化 api 响应，去除 await 先返回再存储
        await this.hotListRp.save(hotListData4Db);
      }
      this.logger.debug('crawlHotListData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw new Error(e);
    }

    return hotListData;
  }
  async delteByCreateTime(date) {
    return await this.hotListRp
      .createQueryBuilder()
      .delete()
      .where('createTime like :date', { date: date + '%' })
      .execute();
  }
  async findAll() {
    return await this.hotListRp.find();
  }
  async findByLimit(len = 20) {
    return await this.hotListRp
      .createQueryBuilder('hot_list_data')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }
}
