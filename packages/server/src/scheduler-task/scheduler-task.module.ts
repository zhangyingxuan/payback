import { Module } from '@nestjs/common';
import { SchedulerTaskService } from './scheduler-task.service';

// 定时任务模块
@Module({
  providers: [SchedulerTaskService],
  exports: [SchedulerTaskService],
})
export class SchedulerTaskModule { }
