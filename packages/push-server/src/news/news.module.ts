import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule { }
