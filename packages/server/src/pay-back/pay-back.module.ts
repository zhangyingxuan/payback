import { Module } from '@nestjs/common';
import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { ApiTestService } from './service/apiTest.service';
import { PayBackController } from './pay-back.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { shortTermData } from "./entities/shortTermData.entity";
import { marketData } from "./entities/marketData.entity";
import { fundsData } from "./entities/fundsData.entity";
import { hotList } from "./entities/hotList.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([shortTermData]),
    TypeOrmModule.forFeature([marketData]),
    TypeOrmModule.forFeature([hotList]),
    TypeOrmModule.forFeature([fundsData]),
  ],
  controllers: [PayBackController],
  providers: [ShorTermService, MarketService, FundsService, HotListService, ApiTestService]
})
export class PayBackModule { }
