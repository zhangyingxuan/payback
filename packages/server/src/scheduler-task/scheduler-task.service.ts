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
