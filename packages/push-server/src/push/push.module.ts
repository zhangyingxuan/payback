import { Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { FeishuRobotService } from './feishu-robot.service';

@Module({
  controllers: [PushController],
  providers: [PushService, FeishuRobotService],
  exports: [PushService],
})
export class PushModule { }
