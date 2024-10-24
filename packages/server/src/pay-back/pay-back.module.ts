import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
// service
import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { PlateService } from './service/plate.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { SpecialStockService } from './service/specialStock.service';
import { ThsService } from './service/ths.service';
import { SystemConfigService } from './service/systemConfig.service';
import { ApiTestService } from './service/apiTest.service';
import { QyWechatNotice } from './service/qyWechatNotice.service';
// controller
import { ThsTradeController } from './ths-trade.controller';
import { PayBackController } from './pay-back.controller';
import { SystemConfigController } from './systemConfig.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
// entity
import { shortTermData } from './entities/shortTermData.entity';
import { specialStock } from './entities/specialStock.entity';
import { marketData } from './entities/marketData.entity';
import { plateData } from './entities/plateData.entity';
import { fundsData } from './entities/fundsData.entity';
import { hotList } from './entities/hotList.entity';
import { latestConceptPlate } from './entities/latestConceptPlate.entity';
import { reviewData } from './entities/review.entity';
import { systemConfig } from './entities/systemConfig.entity';
// module
import { UsersModule } from '../users/users.module';
import { SchedulerTaskModule } from '../scheduler-task/scheduler-task.module';

@Module({
  imports: [
    UsersModule,
    SchedulerTaskModule,
    TypeOrmModule.forFeature([shortTermData]),
    TypeOrmModule.forFeature([specialStock]),
    TypeOrmModule.forFeature([marketData]),
    TypeOrmModule.forFeature([plateData]),
    TypeOrmModule.forFeature([hotList]),
    TypeOrmModule.forFeature([fundsData]),
    TypeOrmModule.forFeature([reviewData]),
    TypeOrmModule.forFeature([systemConfig]),
    TypeOrmModule.forFeature([latestConceptPlate]),
    // microservice 微服务
    ClientsModule.register([
      {
        name: 'PUSH_SERVER',
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [PayBackController, ThsTradeController, SystemConfigController],
  providers: [
    ShorTermService,
    SpecialStockService,
    MarketService,
    PlateService,
    FundsService,
    HotListService,
    LatestConceptPlateService,
    ReviewService,
    ThsService,
    SystemConfigService,
    ApiTestService,
    QyWechatNotice,
  ],
})
export class PayBackModule { }
