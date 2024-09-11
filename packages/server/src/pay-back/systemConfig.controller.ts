import { Controller, Get, Logger, Post, Body } from '@nestjs/common';
import { SystemConfigService } from './service/systemConfig.service';
import { newsPushSchedulerTask } from '../scheduler-task/config';
import { SchedulerTaskService } from '@/scheduler-task/scheduler-task.service';
import { ThsService } from './service/ths.service';
// import { Public } from '../decorator/public.decorator';

class SystemConfigDto {
  isAutoAddSelf: number;
  isAutoAddSelfEvenBoard: number;
  isAutoAddSelfFirstBoard: number;
  isBinddingDelEventBoard: number;
  // 是否竞价删除 首板
  isBinddingDelFirstBoard: number;
  // 是否自动推送新闻到企微机器人
  isAutoPushNews: number;
}

@Controller('system-config')
export class SystemConfigController {
  constructor(
    private readonly systemConfigService: SystemConfigService,
    private readonly schedulerTaskService: SchedulerTaskService,
    private readonly thsService: ThsService,
  ) { }

  private readonly logger = new Logger(SystemConfigController.name);

  // @Public()
  @Get('fetchSystemConfig')
  async fetchSystemConfig() {
    const config = await this.systemConfigService.findLatestOne();
    return {
      code: 0,
      data: config,
    };
  }

  // @Public()
  @Post('/updateSystemConfig')
  async updateSystemConfig(@Body() body: SystemConfigDto) {
    const config = await this.systemConfigService.findLatestOne();
    // 覆盖原有配置
    const result = await this.systemConfigService.updateSystemConfig({ ...config, ...body });
    return {
      code: 0,
      data: result,
    };
  }

  // 推送启用、禁用
  @Post('/toggleNewsPushEnable')
  async toggleNewsPushEnable(@Body() body: SystemConfigDto) {
    try {
      // 加入定时任务
      if (body.isAutoPushNews) {
        // 先判断是否存在，存在则不添加
        const doesExist = this.schedulerTaskService.doesExist('cron', newsPushSchedulerTask.taskName);
        !doesExist &&
          this.schedulerTaskService.executeTask(newsPushSchedulerTask.taskName, newsPushSchedulerTask.cron, () => {
            this[newsPushSchedulerTask.service][newsPushSchedulerTask.func]();
          });
      } else {
        this.schedulerTaskService.deleteCron(newsPushSchedulerTask.taskName);
      }
      await this.systemConfigService.updateSystemConfig(body);
    } catch (e) {
      this.logger.error(e);
      return {
        code: 1,
        message: e.message,
      };
    }
    return {
      code: 0,
      data: null,
    };
  }
}
