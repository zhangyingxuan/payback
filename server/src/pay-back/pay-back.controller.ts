import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PayBackService } from './pay-back.service';
import { CreatePayBackDto } from './dto/create-pay-back.dto';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';

@Controller('pay-back')
export class PayBackController {
  constructor(private readonly payBackService: PayBackService) { }

  @Get('/autoCrawl')
  autoCrawl() {
    return this.payBackService.crawlTodayData();
  }
  // @Get('/storageTodayData')
  // storageTodayData(@Body() createPayBackDto: CreatePayBackDto) {
  //   return this.payBackService.create(createPayBackDto);
  // }

  @Get('list')
  findByLimit(@Query() query) {
    const limit = +(query.limit || 20)
    return this.payBackService.findByLimit(limit);
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
