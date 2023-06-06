import { Module } from '@nestjs/common';
import { PayBackService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { PayBackController } from './pay-back.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { shortTermData } from "./entities/shortTermData.entity";
import { marketData } from "./entities/marketData.entity";
import { fundsData } from "./entities/fundsData.entity";
import { hotList } from "./entities/hotList.entity";
// import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([shortTermData]),
    TypeOrmModule.forFeature([marketData]),
    TypeOrmModule.forFeature([hotList]),
    TypeOrmModule.forFeature([fundsData]),
    // HttpModule.register({
    //   timeout: 15000,
    //   maxRedirects: 5,
    // }),
  ],
  controllers: [PayBackController],
  providers: [PayBackService, MarketService, FundsService, HotListService]
})
export class PayBackModule { }
