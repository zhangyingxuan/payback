import { Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { ReviewChartsPushService } from './review-charts.service';

@Module({
  controllers: [PushController],
  providers: [PushService, ReviewChartsPushService],
  exports: [PushService],
})
export class PushModule { }
