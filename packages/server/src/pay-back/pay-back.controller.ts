import { Controller, Get, Logger, Query, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { SpecialStockService } from './service/specialStock.service';
import { MarketService } from './service/market.service';
import { PlateService } from './service/plate.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { ThsService } from './service/ths.service';
import { ApiTestService } from './service/apiTest.service';
import { Public } from '../decorator/public.decorator';
// import { Cron } from '@nestjs/schedule';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as dayjs from 'dayjs';

class CrawlTodayDataDto {
  fetchTodayDataType: number;
  isRemoveIncompatible: number;
}

@Controller('pay-back')
export class PayBackController {
  constructor(
    private readonly shorTermService: ShorTermService,
    private readonly specialStockService: SpecialStockService,
    private readonly fundsService: FundsService,
    private readonly hotListService: HotListService,
    private readonly reviewService: ReviewService,
    private readonly thsService: ThsService,
    private readonly apiTestService: ApiTestService,
    private readonly latestConceptPlateService: LatestConceptPlateService,
    private readonly usersService: UsersService,
    private readonly marketService: MarketService,
    private readonly plateService: PlateService,
  ) { }

  private readonly logger = new Logger(PayBackController.name);

  @Public()
  @Get('testApi')
  async testApi() {
    // return await this.apiTestService.otherTest();
    // return await this.usersService.getUserByAccount('admin');
    // return await this.apiTestService.fetchExternalData();
    // return await this.apiTestService.datacenterWeb();
    return 'testApi';
  }

  // @Cron('0 */5 9-12 * * 1-5')
  async autoCrawlTodayDataAM() {
    // 早盘需要精确到 9.20 - 11.30，其他时间返回
    this.logger.debug('[必入]定时任务执行了！0 */5 9-12 * * 1-5');
    const currentTime = dayjs();
    const currentDate = currentTime.format('YYYY-MM-DD');
    // 时间返回判断;9.20 - 11.30
    // this.logger.debug('定时任务执行了！0 */5 9-12 * * 1-5', currentDate + ' 09:19:00', currentTime, currentTime.isAfter(currentDate + ' 09:19:00'), currentTime.isBefore(currentDate + ' 11:31:00'));
    if (currentTime.isAfter(currentDate + ' 09:19:00') && currentTime.isBefore(currentDate + ' 11:31:00')) {
      // this.crawlTodayData();
      this.logger.debug('[选入]定时任务执行了！0 */5 9-12 * * 1-5');
    }
  }

  // 下午1点到2.55，每隔5分钟执行一次
  // @Cron('0 */5 13-14 * * 1-5')
  async autoCrawlTodayDataPM() {
    this.logger.debug('定时任务执行了！0 */5 13-15 * * 1-5');
    // this.crawlTodayData();
  }

  // @Public()
  // @Cron('0 25 9 * * 1-5')
  @Post('/crawlTodayData')
  @UseGuards(JwtAuthGuard)
  async crawlTodayData(@Body() body: CrawlTodayDataDto, @Request() req) {
    let short, funds, market, bindding, resultData, plate, specialStock;
    switch (body.fetchTodayDataType) {
      case 0:
        short = this.shorTermService.crawlShortTermData();
        funds = this.fundsService.crawlfundsData();
        market = this.marketService.crawlMarketData();
        bindding = this.specialStockService.crawlBinddingData(0, req.user?.account);
        specialStock = this.specialStockService.crawlSpecialStockData();
        plate = this.plateService.crawlPlateData();
        resultData = {};
        await Promise.all([short, funds, market, bindding, specialStock, plate]);
        // resultData = { shortData, fundsData, marketData, binddingData, plateData };
        break;
      case 1:
        resultData = await this.shorTermService.crawlShortTermData();
        break;
      case 2:
        // 更新板块数据涨停家数排序 & 市场数据（行业、概念涨跌幅）
        plate = this.plateService.crawlPlateData();
        market = this.marketService.crawlMarketData();
        await Promise.all([plate, market]);
        break;
      case 3:
        resultData = await this.fundsService.crawlfundsData();
        break;
      case 4:
        // 获取竞价数据
        // 是否剔除 不及预期数据；注意接收到的参数 是否为字符串
        const crawlBindding = this.specialStockService.crawlBinddingData(body.isRemoveIncompatible, req.user?.account);
        const crawlSpecialStock = this.specialStockService.crawlSpecialStockData();

        const [crawlBinddingData, crawlSpecialStockData] = await Promise.all([crawlBindding, crawlSpecialStock]);
        resultData = crawlSpecialStockData;
        break;
      default:
        break;
    }

    return {
      code: 200,
      data: resultData,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/crawlBinddingData')
  async crawlBinddingData(@Body() body: CrawlTodayDataDto, @Request() req) {
    // 是否剔除 不及预期数据；注意接收到的参数 是否为字符串
    const binddingData = await this.specialStockService.crawlBinddingData(body.isRemoveIncompatible, req.user?.account);
    let result = null;
    // 组装为当日连板数据
    try {
      const currentDayEventData = await this.shorTermService.findEvenBoardByLimit(3);
      result = currentDayEventData[1];
      result.newStock = binddingData.newStock;
      result.chooseStock = binddingData.chooseStock;
      // 竞价修改时间改为 正确的时间
      result.biddingDataUpdateTime = currentDayEventData[0].biddingDataUpdateTime;
    } catch (e) {
      this.logger.debug(e);
    }
    return {
      code: 200,
      data: result,
    };
  }

  @Post('/crawlSpecialStockData')
  async crawlSpecialStockData() {
    // 是否剔除 不及预期数据；注意接收到的参数 是否为字符串
    const specialStockData = await this.specialStockService.crawlSpecialStockData();
    return {
      code: 200,
      data: specialStockData,
    };
  }

  @Post('/deleteData')
  async deleteData(@Body() body: any) {
    let code = 200,
      message = 'success';
    try {
      // 删除短线数据
      const shorTerm = this.shorTermService.delteByCreateTime(body.date);
      // 删除竞价数据
      const specialStock = this.specialStockService.delteByCreateTime(body.date);
      // 删除市场数据
      const market = this.marketService.delteByCreateTime(body.date);
      // 资金数据
      const funds = this.fundsService.delteByCreateTime(body.date);
      // 板块数据
      const plate = this.plateService.delteByCreateTime(body.date);
      await Promise.all([shorTerm, specialStock, market, funds, plate]);
    } catch (e) {
      code = 500;
      message = e;
    }
    return {
      code,
      message,
    };
  }

  // @Public()
  @Get('/crawlHotListData')
  crawlHotListData() {
    return this.hotListService.crawlHotListData();
  }

  // 示例：http://localhost:3000/blowsysun/pay-back/crawlShortTermByDate?date=2023-06-26
  @Public()
  @Get('/crawlShortTermByDate')
  crawlShortTermByDate(@Query() query) {
    const date = query.date || new Date();
    return this.shorTermService.crawlShortTermDataByDate(date);
  }
  /**
   * 爬取最新 涨停家数较多的 板块数据
   * @returns
   */
  @Public()
  @Get('/crawlPlateData')
  async crawlPlateData() {
    const data = await this.plateService.crawlPlateData();
    return {
      code: 200,
      data,
    };
  }

  @Get('list')
  async findByLimit(@Query() query) {
    const limit = +(query.limit || 20);
    const shortTermData = (await this.shorTermService.findByLimit(limit)).reverse();
    const marketData = (await this.marketService.findByLimit(limit)).reverse();
    const fundsData = (await this.fundsService.findByLimit(limit)).reverse();
    return {
      code: 200,
      data: {
        shortTermData,
        marketData,
        fundsData,
      },
    };
  }

  @Get('fetchEvenBoardData')
  async fetchEvenBoardData(@Query() query) {
    const limit = +(query.limit || 20);
    // isMobile
    // const isMobile = query.isMobile || 'true';
    const shortTermData = await this.shorTermService.findEvenBoardByLimit(limit);
    // 移动端 日期近的在前面，PC相反
    // if (isMobile == 'true') {
    //   shortTermData = shortTermData.reverse();
    // }
    return {
      code: 200,
      data: shortTermData,
    };
  }

  @Get('fetchHostListData')
  async fetchHostListData(@Query() query) {
    const limit = +(query.limit || 20);
    const hotListData = await this.hotListService.findByLimit(limit);
    return {
      code: 200,
      data: hotListData,
    };
  }

  @Get('fetchReveiwDataByDate')
  async fetchReveiwDataByDate(@Query() query) {
    const date = query.date || new Date();
    const reviewData = await this.reviewService.findByDate(date);
    return {
      code: 200,
      data: reviewData,
    };
  }

  @Get('findConceptPlateWithinNDays')
  async findConceptPlateWithinNDays(@Query() query) {
    const nDays = +(query.nDays || 15);
    const palateData = await this.latestConceptPlateService.findWithinNDays(nDays);
    return {
      code: 200,
      data: palateData,
    };
  }
  @Get('findConceptPlateByLimit')
  async findConceptPlateByLimit(@Query() query) {
    const nDays = +(query.nDays || 15);
    const palateData = await this.latestConceptPlateService.findByLimit(nDays);
    return {
      code: 200,
      data: palateData,
    };
  }
  @Get('findPlateByLimit')
  async findPlateByLimit(@Query() query) {
    const limit = +(query.limit || 20);
    const palateData = await this.marketService.findPlateByLimit(limit);
    return {
      code: 200,
      data: palateData,
    };
  }
  @Get('fetchPlateOrderByDailyLimit')
  async fetchPlateOrderByDailyLimit(@Query() query) {
    const limit = +(query.limit || 20);
    const palateData = await this.plateService.findByLimit(limit);
    return {
      code: 200,
      data: palateData,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('saveUserInfo')
  async saveUserInfo(@Body() body: any, @Request() req) {
    const { token, user } = body;
    const success = await this.usersService.updateUserInfo(req.user?.account, token, user);

    return {
      code: success ? 200 : 500,
    };
  }
}
