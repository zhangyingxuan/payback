import { Module } from '@nestjs/common';
import { PayBackService } from './pay-back.service';
import { MarketService } from './market.service';
import { PayBackController } from './pay-back.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { shortTermData } from "./entities/shortTermData.entity";
import { marketData } from "./entities/marketData.entity";

@Module({
  imports: [TypeOrmModule.forFeature([shortTermData]), TypeOrmModule.forFeature([marketData])],
  controllers: [PayBackController],
  providers: [PayBackService, MarketService]
})
export class PayBackModule { }
