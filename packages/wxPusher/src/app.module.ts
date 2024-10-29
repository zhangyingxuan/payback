import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getRobotInstance } from './utils/ding-dong-bot';

@Module({
  controllers: [AppController],
  providers: [AppService, { provide: 'BotInstance', useValue: getRobotInstance() }],
})
export class AppModule { }
