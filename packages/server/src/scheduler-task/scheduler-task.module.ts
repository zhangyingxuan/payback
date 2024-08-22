import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerTaskService } from './scheduler-task.service';

// 定时任务模块
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SchedulerTaskService],
  exports: [SchedulerTaskService],
})
export class SchedulerTaskModule { }
