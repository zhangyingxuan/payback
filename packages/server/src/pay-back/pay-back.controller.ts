import { Controller, Get, Post, Body, Patch, Param, Delete, Query, } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ApiTestService } from './service/apiTest.service';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';
import { Public } from '../decorator/public.decorator';

@Controller('pay-back')
export class PayBackController {
  constructor(
    private readonly ShorTermService: ShorTermService,
    private readonly fundsService: FundsService,
    private readonly hotListService: HotListService,
    private readonly apiTestService: ApiTestService,
    private readonly latestConceptPlateService: LatestConceptPlateService,
    private readonly marketService: MarketService) { }

  @Public()
  @Get('testApi')
  async testApi() {
    // this.apiTestService.fetchHotList();
    return await this.apiTestService.fetchExternalData();
    // this.apiTestService.getTodos();
  }

  @Public()
  @Get('/crawlTodayData')
  async crawlTodayData() {
    const shortData = await this.ShorTermService.crawlShortTermData();
    const marketData = await this.marketService.crawlMarketData();
    const fundsData = await this.fundsService.crawlfundsData();
    return {
      shortData,
      fundsData,
      marketData
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
    // 移动端 日期近的在前面，PC相反
    return {
      code: 200,
      data: hotListData,
    };
  }
  @Get('findPlateByLimit')
  async findPlateByLimit(@Query() query) {
    const limit = +(query.limit || 20);
    let palateData = await this.marketService.findPlateByLimit(limit);
    // 移动端 日期近的在前面，PC相反
    return {
      code: 200,
      data: palateData,
    };
  }

  @Get('queryAll')
  findAll() {
    return this.ShorTermService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayBackDto: UpdatePayBackDto) {
    return this.ShorTermService.update(+id, updatePayBackDto);
  }
}
