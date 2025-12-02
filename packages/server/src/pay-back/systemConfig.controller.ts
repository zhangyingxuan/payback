import { Controller, Get, Logger, Post, Body, Inject, UseGuards } from '@nestjs/common';
import { SystemConfigService } from './service/systemConfig.service';
import { newsPushSchedulerTask } from '../scheduler-task/config';
import { SchedulerTaskService } from '@/scheduler-task/scheduler-task.service';
import { ClientProxy } from '@nestjs/microservices';
import { AdminGuard } from '../auth/admin.guard';
import { Admin } from '../auth/admin.decorator';
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
    @Inject('PUSH_SERVER') private pushServer: ClientProxy,
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

  @Admin()
  @UseGuards(AdminGuard)
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
  @Admin()
  @UseGuards(AdminGuard)
  @Post('/toggleNewsPushEnable')
  async toggleNewsPushEnable(@Body() body: SystemConfigDto) {
    try {
      // 先判断是否存在，存在则不添加
      const doesExist = this.schedulerTaskService.doesExist('cron', newsPushSchedulerTask.taskName);

      // 加入定时任务
      // if (body.isAutoPushNews) {
      if (body.isAutoPushNews && process.env.NODE_ENV !== 'dev') {
        !doesExist &&
          this.schedulerTaskService.executeTask(newsPushSchedulerTask.taskName, newsPushSchedulerTask.cron, () => {
            this.logger.debug('执行定时任务 fetchNewsTask');
            // this[newsPushSchedulerTask.service][newsPushSchedulerTask.func]();
            this[newsPushSchedulerTask.service].emit(newsPushSchedulerTask.func, {});
          });
      } else {
        doesExist && this.schedulerTaskService.deleteCron(newsPushSchedulerTask.taskName);
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
