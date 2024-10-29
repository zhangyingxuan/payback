import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { PushModule } from './push/push.module';
import { ConsulModule } from './consul/consul.module';
import { ConsulService } from './consul/consul.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

const envFilePath = `.env.${process.env.NODE_ENV || 'prod'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    NewsModule,
    PushModule,
    ConsulModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly consulService: ConsulService,
    private readonly config: ConfigService,
  ) { }

  async onModuleInit() {
    const config = this.config;
    console.log(
      config.get('APP_NAME'),
      config.get('APP_HOST'),
      config.get('APP_PORT'),
    );
    await this.consulService.register({
      name: config.get('APP_NAME'),
      address: config.get('APP_HOST'),
      port: Number(config.get('APP_PORT') || 3001),
    });
  }
}
