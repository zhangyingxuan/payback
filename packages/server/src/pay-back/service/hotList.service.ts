import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { InjectRepository } from '@nestjs/typeorm';
import playWrightUtil from '../utils/playWrightUtil'
import { CreateHotListDto } from '../dto/create-hot-list.dto';
import * as dayjs from 'dayjs';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class HotListService {
  constructor(
    @InjectRepository(hotList) private readonly hotListRp: Repository<hotList>,
  ) { }

  private readonly logger = new Logger(HotListService.name);

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  @Cron('0 30 */1 * * *')
  async crawlHotListData() {
    let isExist = false;
    this.logger.debug('crawlHotListData is Begining!');
    // 如果存在数据，则返回已有该数据
    const todayDateStr = new Date().toLocaleDateString();
    const todayDataFromDB = await this.hotListRp
      .createQueryBuilder('hot_list')
      .where("hot_list.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
      .getOne();

    if (todayDataFromDB) {
      // 如果有数据则更新
      isExist = true;
    }
    let hotListData: CreateHotListDto;
    try {
      hotListData = await playWrightUtil.getHotListData();
      this.logger.log(hotListData);
      if (isExist) {
        this.logger.error('更新数据')
        await this.hotListRp.update(todayDataFromDB.id, hotListData);
      } else {
        this.logger.error('新增数据')
        await this.hotListRp.save(hotListData);
      }
      this.logger.debug('crawlHotListData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e)
    }
    return hotListData;
  }

  async findAll() {
    return await this.hotListRp.find();
  }
  async findByLimit(len: number = 20) {
    return await this.hotListRp
      .createQueryBuilder('hot_list_data')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }
}
