import { Module } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { ApiTestService } from './service/apiTest.service';
import { PayBackController } from './pay-back.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { shortTermData } from "./entities/shortTermData.entity";
import { marketData } from "./entities/marketData.entity";
import { fundsData } from "./entities/fundsData.entity";
import { hotList } from "./entities/hotList.entity";
import { latestConceptPlate } from "./entities/latestConceptPlate.entity";
import { reviewData } from "./entities/review.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([shortTermData]),
    TypeOrmModule.forFeature([marketData]),
    TypeOrmModule.forFeature([hotList]),
    TypeOrmModule.forFeature([fundsData]),
    TypeOrmModule.forFeature([reviewData]),
    TypeOrmModule.forFeature([latestConceptPlate]),
  ],
  controllers: [PayBackController],
  providers: [ShorTermService, MarketService, FundsService, HotListService, LatestConceptPlateService, ReviewService, ApiTestService]
})
export class PayBackModule { }
