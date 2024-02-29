import { Controller, Get, Logger, Query, Post, Body } from '@nestjs/common';
import { SystemConfigService } from './service/systemConfig.service';
// import { Public } from '../decorator/public.decorator';

class SystemConfigDto {
  isAutoAddSelfStock: number;
}

@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) { }

  private readonly logger = new Logger(SystemConfigController.name);

  // @Public()
  @Get('fetchSystemConfig')
  async fetchSystemConfig() {
    const config = await this.systemConfigService.findLatestOne();
    return {
      code: 200,
      data: config,
    };
  }

  // @Public()
  @Post('/updateSystemConfig')
  async updateSystemConfig(@Body() body: SystemConfigDto) {
    const result = await this.systemConfigService.updateSystemConfig(body);
    return {
      code: 200,
      data: result,
    };
  }
}
