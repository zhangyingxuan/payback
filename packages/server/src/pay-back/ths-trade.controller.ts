import { Controller, Get, Post, Body, Patch, Param, Delete, Query, } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { ThsService } from './service/ths.service';
import { ApiTestService } from './service/apiTest.service';
import { Public } from '../decorator/public.decorator';

@Controller('ths-trade')
export class ThsTradeController {
  constructor(
    private readonly thsService: ThsService,
    private readonly shorTermService: ShorTermService,
    private readonly apiTestService: ApiTestService) { }

  /**
   * 同步自选
   * @returns 
   */
  @Public()
  @Get('/modifyThsSelfStocks')
  async modifyThsSelfStocks() {
    // 获取今天的短线数据
    const result: any = (await this.shorTermService.findEvenBoardByLimit(1))[0];
    return this.thsService.modifyThsSelfStocks(JSON.parse(result.evenBoardData), result.dailyLimitQuantity);
  }
}
