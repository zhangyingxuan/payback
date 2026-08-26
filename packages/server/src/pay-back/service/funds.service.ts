import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { fundsData } from '../entities/fundsData.entity';
import { InjectRepository } from '@nestjs/typeorm';
import fundsUtil from '../utils/fundsUtil';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { toIwencaiDate, toTradeDate } from '../utils/tradeDateUtil';
import { UsersService } from '@/users/users.service';
import { getIwencaiCookie } from '../utils/thsUtils';

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(fundsData) private readonly fundsDataRp: Repository<fundsData>,
    private readonly usersService: UsersService,
  ) {}

  private readonly logger = new Logger(FundsService.name);

  // // 尾盘
  // @Cron('0 10 16 * * 1-5')
  // async autoCrawlfundsDataLateSession() {
  //   this.crawlfundsData();
  // }

  // // 更新北向资金
  // @Cron('0 10 18 * * 1-5')
  // async autoCrawlnorthDataLateSession() {
  //   this.crawlfundsData();
  // }

  // // 午盘
  // @Cron('0 41 11 * * 1-5')
  // async autoCrawlfundsDataMidday() {
  //   this.crawlfundsData();
  // }

  // * * * * * *：每一秒
  // 45 * * * * *：每分钟，在45秒
  // * 10 * * * *：每小时一次，十分钟开始
  // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
  // 0 30 11 * * 1-5：星期一至星期五上午11:30
  async crawlfundsData(account = 'admin') {
    this.logger.debug('crawlfundsData is Begining!');
    const todayDateStr = toTradeDate();
    let fundsData: CreateFundsDataDto;
    try {
      fundsData = await fundsUtil.getFundsData(
        toIwencaiDate(todayDateStr),
        getIwencaiCookie(await this.usersService.getUserByAccount(account)),
      );
      fundsData.tradeDate = todayDateStr;
      // 如果存在数据，则返回已有该数据
      const todayDataFromDB = await this.fundsDataRp
        .createQueryBuilder('market_data')
        .where('market_data.tradeDate = :tradeDate', { tradeDate: todayDateStr })
        .orWhere('market_data.tradeDate IS NULL AND DATE(market_data.createTime) = :tradeDate', {
          tradeDate: todayDateStr,
        })
        .getOne();

      if (todayDataFromDB) {
        this.logger.log('crawlfundsData 更新数据');
        await this.fundsDataRp.update(todayDataFromDB.id, fundsData);
      } else {
        this.logger.log('crawlfundsData 新增数据');
        await this.fundsDataRp.save(fundsData);
      }
      this.logger.debug('crawlfundsData is success!');
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      throw e;
    }
    // 深圳 还是 上海涨停的多 SZ. SH
    return fundsData;
  }

  async findAll() {
    return await this.fundsDataRp.find();
  }
  async findByLimit(len = 20) {
    return await this.fundsDataRp
      .createQueryBuilder('funds_data')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }

  async deleteByCreateTime(date) {
    return await this.fundsDataRp
      .createQueryBuilder()
      .delete()
      .where('createTime like :date', { date: date + '%' })
      .execute();
  }
}
