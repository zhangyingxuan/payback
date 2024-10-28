import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { PushModule } from './push/push.module';
import { ConsulModule } from './consul/consul.module';
import { ConsulService } from './consul/consul.service';

@Module({
  imports: [NewsModule, PushModule, ConsulModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly consulService: ConsulService) { }

  async onModuleInit() {
    await this.consulService.register({
      name: 'PUSH_SERVER',
      address: '43.154.139.108',
      port: 3001,
    });
  }
}
