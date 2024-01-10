import { Module } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { SpecialStockService } from './service/specialStock.service';
import { ThsService } from './service/ths.service';
import { ApiTestService } from './service/apiTest.service';
import { ThsTradeController } from './ths-trade.controller';
import { PayBackController } from './pay-back.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { shortTermData } from './entities/shortTermData.entity';
import { specialStock } from './entities/specialStock.entity';
import { marketData } from './entities/marketData.entity';
import { fundsData } from './entities/fundsData.entity';
import { hotList } from './entities/hotList.entity';
import { latestConceptPlate } from './entities/latestConceptPlate.entity';
import { reviewData } from './entities/review.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([shortTermData]),
    TypeOrmModule.forFeature([specialStock]),
    TypeOrmModule.forFeature([marketData]),
    TypeOrmModule.forFeature([hotList]),
    TypeOrmModule.forFeature([fundsData]),
    TypeOrmModule.forFeature([reviewData]),
    TypeOrmModule.forFeature([latestConceptPlate]),
  ],
  controllers: [PayBackController, ThsTradeController],
  providers: [
    ShorTermService,
    SpecialStockService,
    MarketService,
    FundsService,
    HotListService,
    LatestConceptPlateService,
    ReviewService,
    ThsService,
    ApiTestService,
  ],
})
export class PayBackModule {}
