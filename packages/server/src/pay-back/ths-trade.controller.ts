import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { ThsService } from './service/ths.service';
import { Public } from '../decorator/public.decorator';
import { ThsOprate } from './core/fetchUtil';

@Controller('ths-trade')
export class ThsTradeController {
  constructor(private readonly thsService: ThsService, private readonly shorTermService: ShorTermService) {}

  /**
   * 同步自选
   * @returns
   */
  @Public()
  @Get('modifyThsSelfStocks')
  async modifyThsSelfStocks() {
    // 获取今天的短线数据
    const result: any = (await this.shorTermService.findEvenBoardByLimit(1))[0];
    return this.thsService.modifyThsSelfStocks(JSON.parse(result.evenBoardData));
  }
  /**
   * 新增自选
   * @returns
   */
  @Post('addThsSelfStock')
  async addThsSelfStock(@Body('code') code: string) {
    return this.thsService.updateThsSelfStock(code, ThsOprate.add);
  }

  /**
   * 删除自选
   * @returns
   */
  @Post('delThsSelfStock')
  async delThsSelfStock(@Body('code') code: string) {
    return this.thsService.updateThsSelfStock(code, ThsOprate.del);
  }
}
