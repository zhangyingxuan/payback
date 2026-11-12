import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { getTradingDayInfo, toShanghaiDate } from 'pay-back-core';

// 自定义定时任务服务
@Injectable()
export class SchedulerTaskService {
  private readonly logger = new Logger(SchedulerTaskService.name);
  private lastUnknownDate?: string;
  constructor(
    // 定时任务注册器
    private readonly schedulerRegistry: SchedulerRegistry,
  ) { }

  // 执行任务
  public async executeTask(
    // 任务名称
    name: string,
    // cron表达式
    cronExpression: Date | string,
    // 回调函数
    callback: () => void,
    // 执行完后是否需要删除
    needDel?: boolean,
    // 默认仅交易日执行，热榜通过配置显式豁免
    tradingDaysOnly = true,
  ) {
    try {
      // 防止启动流程或初始化接口被重复调用时注册同名任务
      if (this.doesExist('cron', name)) {
        return;
      }

      let running = false;
      // 创建定时任务
      const job: CronJob = new CronJob(cronExpression, async () => {
        // 外部数据源响应较慢时，避免同一任务重入
        if (running) {
          return;
        }

        running = true;
        try {
          // 每次触发重新判断，避免服务跨日运行后沿用启动当天的状态。
          if (tradingDaysOnly) {
            const date = toShanghaiDate();
            const info = getTradingDayInfo(date);
            if (info.status === 'unknown' && this.lastUnknownDate !== date) {
              this.lastUnknownDate = date;
              this.logger.warn(`${date} 缺少已核验交易日历，暂停除热榜外的定时任务，请更新 core 休市表`);
            }
            if (info.status !== 'open') return;
          }
          if (callback) {
            await callback();
          }
        } finally {
          running = false;
          // 删除一次性定时任务
          needDel && this.deleteCron(name);
        }
      }, null, false, 'Asia/Shanghai');
      // 添加定时任务
      this.schedulerRegistry.addCronJob(name, job);
      // 启动定时任务
      job.start();
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
  }
  // 删除任务
  public deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
  }

  // 判断是否存在任务
  public doesExist(type: 'cron' | 'timeout' | 'interval', name: string) {
    return this.schedulerRegistry.doesExist(type, name);
  }
}
