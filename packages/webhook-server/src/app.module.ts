import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { DeployModule } from './deploy/deploy.module';
// consul配置
import { ConsulModule } from './consul/consul.module';
import { ConsulService } from './consul/consul.service';
const envFilePath = `.env.${process.env.NODE_ENV || 'prod'}`;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      cache: true, // 启用缓存提高性能
    }),
    WebhookModule,
    DeployModule,
    // microservice 微服务
    ConsulModule.forRoot(),
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly consulService: ConsulService, private readonly config: ConfigService) { }

  async onModuleInit() {
    const config = this.config;
    console.log(config.get('APP_NAME'), config.get('APP_HOST'), config.get('APP_PORT'));

    await this.consulService.register({
      name: config.get('APP_NAME'),
      address: config.get('APP_HOST'),
      port: Number(config.get('APP_PORT') || 3000),
    });
  }
}
