import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { PushModule } from './push/push.module';

@Module({
  imports: [NewsModule, PushModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
