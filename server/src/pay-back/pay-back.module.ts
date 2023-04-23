import { Module } from '@nestjs/common';
import { PayBackService } from './pay-back.service';
import { PayBackController } from './pay-back.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { shortTermData } from "./entities/shortTermData.entity";

@Module({
  imports: [TypeOrmModule.forFeature([shortTermData])],
  controllers: [PayBackController],
  providers: [PayBackService]
})
export class PayBackModule { }
