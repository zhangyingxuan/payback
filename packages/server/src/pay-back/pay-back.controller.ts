import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PayBackService } from './pay-back.service';
import { MarketService } from './market.service';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';

@Controller('pay-back')
export class PayBackController {
  constructor(private readonly payBackService: PayBackService, private readonly marketService: MarketService) { }

  @Get('/autoCrawl')
  autoCrawl() {
    return this.payBackService.crawlTodayData();
  }
  @Get('/crawlMarket')
  crawlMarket() {
    return this.marketService.crawlMarketData();
  }
  // @Get('/storageTodayData')
  // storageTodayData(@Body() createPayBackDto: CreatePayBackDto) {
  //   return this.payBackService.create(createPayBackDto);
  // }

  @Get('list')
  async findByLimit(@Query() query) {
    const limit = +(query.limit || 20)
    const shortTermData = await this.payBackService.findByLimit(limit);
    const marketData = await this.marketService.findByLimit(limit);
    return {
      code: 200,
      data: {
        shortTermData,
        marketData,
      }
    };
  }

  @Get('queryAll')
  findAll() {
    return this.payBackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payBackService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayBackDto: UpdatePayBackDto) {
    return this.payBackService.update(+id, updatePayBackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payBackService.remove(+id);
  }
}
