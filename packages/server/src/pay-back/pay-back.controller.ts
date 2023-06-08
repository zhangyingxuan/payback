import { Controller, Get, Post, Body, Patch, Param, Delete, Query, } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';
import { Public } from '../decorator/public.decorator';

@Controller('pay-back')
export class PayBackController {
  constructor(
    private readonly ShorTermService: ShorTermService,
    private readonly fundsService: FundsService,
    private readonly hotListService: HotListService,
    private readonly marketService: MarketService) { }

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
  @Get('/crawlShortTerm')
  crawlShortTerm() {
    return this.ShorTermService.crawlShortTermData();
  }
  @Get('/crawlMarket')
  crawlMarket() {
    return this.marketService.crawlMarketData();
  }
  @Get('/crawlFunds')
  crawlFunds() {
    return this.fundsService.crawlfundsData();
  }
  @Public()
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
    const limit = +(query.limit || 20)
    const shortTermData = (await this.ShorTermService.findEvenBoardByLimit(limit)).reverse();
    return {
      code: 200,
      data: {
        shortTermData,
      }
    };
  }

  @Get('fetchHostListData')
  async fetchHostListData(@Query() query) {
    const limit = +(query.limit || 20)
    const hotListData = (await this.hotListService.findByLimit(limit)).reverse();
    return {
      code: 200,
      data: hotListData,
    };
  }

  @Get('queryAll')
  findAll() {
    return this.ShorTermService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ShorTermService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayBackDto: UpdatePayBackDto) {
    return this.ShorTermService.update(+id, updatePayBackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ShorTermService.remove(+id);
  }
}
