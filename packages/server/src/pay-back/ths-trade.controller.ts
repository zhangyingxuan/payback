import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { ThsService } from './service/ths.service';
import { Public } from '../decorator/public.decorator';
import { ThsOprate } from './core/fetchUtil';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ths-trade')
export class ThsTradeController {
  constructor(private readonly thsService: ThsService, private readonly shorTermService: ShorTermService) { }

  /**
   * 同步自选
   * @returns
   */
  @Public()
  @Get('modifyThsSelfStocks')
  @UseGuards(JwtAuthGuard)
  async modifyThsSelfStocks(@Request() req) {
    // 获取今天的短线数据
    const result: any = (await this.shorTermService.findEvenBoardByLimit(1))[0];
    return await this.thsService.autoModifyThsSelfStocks(JSON.parse(result.evenBoardData), req.user?.account);
  }
  /**
   * 新增自选
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('addThsSelfStock')
  async addThsSelfStock(@Body('code') code: string, @Request() req) {
    return this.thsService.updateThsSelfStock(code, ThsOprate.add, req.user?.account);
  }

  /**
   * 删除自选
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('delThsSelfStock')
  async delThsSelfStock(@Body('code') code: string, @Request() req) {
    return this.thsService.updateThsSelfStock(code, ThsOprate.del, req.user?.account);
  }
  /**
   * 新增自选
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('addThsSelfPlate')
  async addThsSelfPlate(@Body('code') code: string, @Request() req) {
    return this.thsService.updateThsSelfPlate(code, ThsOprate.add, req.user?.account);
  }

  /**
   * 删除自选
   * @returns
   */
  @UseGuards(JwtAuthGuard)
  @Post('delThsSelfPlate')
  async delThsSelfPlate(@Body('code') code: string, @Request() req) {
    return this.thsService.updateThsSelfPlate(code, ThsOprate.del, req.user?.account);
  }
}
