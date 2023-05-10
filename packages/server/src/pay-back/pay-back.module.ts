import { Module } from '@nestjs/common';
import { PayBackService } from './shortTerm.service';
import { MarketService } from './market.service';
import { FundsService } from './funds.service';
import { PayBackController } from './pay-back.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { shortTermData } from "./entities/shortTermData.entity";
import { marketData } from "./entities/marketData.entity";
import { fundsData } from "./entities/fundsData.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([shortTermData]),
    TypeOrmModule.forFeature([marketData]),
    TypeOrmModule.forFeature([fundsData])
  ],
  controllers: [PayBackController],
  providers: [PayBackService, MarketService, FundsService]
})
export class PayBackModule { }
