import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

// 自定义定时任务服务
@Injectable()
export class SchedulerTaskService {
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
  ) {
    try {
      // 创建定时任务
      const job: CronJob = new CronJob(cronExpression, () => {
        if (callback) {
          callback();
        }
        // 删除定时任务
        needDel && this.deleteCron(name);
      });
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
