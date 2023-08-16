import { Controller, Get, Logger, Query, } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { ThsService } from './service/ths.service';
import { ApiTestService } from './service/apiTest.service';
import { Public } from '../decorator/public.decorator';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';

@Controller('pay-back')
export class PayBackController {
  constructor(
    private readonly ShorTermService: ShorTermService,
    private readonly fundsService: FundsService,
    private readonly hotListService: HotListService,
    private readonly reviewService: ReviewService,
    private readonly thsService: ThsService,
    private readonly apiTestService: ApiTestService,
    private readonly latestConceptPlateService: LatestConceptPlateService,
    private readonly marketService: MarketService) { }

  private readonly logger = new Logger(PayBackController.name);

  @Public()
  @Get('testApi')
  async testApi() {
    return await this.apiTestService.fetchExternalData();

    // return await this.apiTestService.datacenterWeb();
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

  @Public()
  @Get('/crawlTodayData')
  async crawlTodayData(@Query() query) {
    const type = +(query.fetchTodayDataType || 0);

    let shortData, fundsData, marketData;
    switch (type) {
      case 0:
        shortData = await this.ShorTermService.crawlShortTermData();
        fundsData = await this.fundsService.crawlfundsData();
        marketData = await this.marketService.crawlMarketData();
        break;
      case 1:
        shortData = await this.ShorTermService.crawlShortTermData();
        break;
      case 2:
        marketData = await this.marketService.crawlMarketData();
        break;
      case 3:
        fundsData = await this.fundsService.crawlfundsData();
        break;
      default:
        break;
    }

    return {
      code: 200,
    };
  }

  @Public()
  @Get('/crawlHotListData')
  crawlHotListData() {
    return this.hotListService.crawlHotListData();
  }
  @Public()
  @Get('/crawlShortTerm')
  crawlShortTerm() {
    return this.ShorTermService.crawlShortTermData();
  }

  // 示例：http://localhost:3000/blowsysun/pay-back/crawlShortTermDataByDate?date=2023-06-26
  @Public()
  @Get('/crawlShortTermByDate')
  crawlShortTermDataByDate(@Query() query) {
    const date = query.date || new Date()
    return this.ShorTermService.crawlShortTermDataByDate(date);
  }
  @Public()
  @Get('/crawlMarket')
  crawlMarket() {
    return this.marketService.crawlMarketData();
  }
  @Public()
  @Get('/crawlFunds')
  crawlFunds() {
    return this.fundsService.crawlfundsData();
  }
  @Public()
  @Get('/crawlLatestConceptPlate')
  crawlLatestConceptPlate() {
    return this.latestConceptPlateService.crawlLatestConceptPlateData();
  }

  @Get('list')
  async findByLimit(@Query() query) {
    const limit = +(query.limit || 20)
    const shortTermData = (await this.ShorTermService.findByLimit(limit)).reverse();
    const marketData = (await this.marketService.findByLimit(limit)).reverse();
    const fundsData = (await this.fundsService.findByLimit(limit)).reverse();
    return {
      code: 200,
      data: {
        shortTermData,
        marketData,
        fundsData,
      }
    };
  }


  @Get('fetchEvenBoardData')
  async fetchEvenBoardData(@Query() query) {
    const limit = +(query.limit || 20);
    // isMobile
    // const isMobile = query.isMobile || 'true';
    let shortTermData = await this.ShorTermService.findEvenBoardByLimit(limit);
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
    let hotListData = await this.hotListService.findByLimit(limit);
    return {
      code: 200,
      data: hotListData,
    };
  }

  @Get('fetchReveiwDataByDate')
  async fetchReveiwDataByDate(@Query() query) {
    const date = query.date || new Date();
    let reviewData = await this.reviewService.findByDate(date);
    return {
      code: 200,
      data: reviewData,
    };
  }

  @Get('findPlateByLimit')
  async findPlateByLimit(@Query() query) {
    const limit = +(query.limit || 20);
    let palateData = await this.marketService.findPlateByLimit(limit);
    return {
      code: 200,
      data: palateData,
    };
  }
}
