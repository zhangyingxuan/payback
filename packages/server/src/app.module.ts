import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PayBackModule } from './pay-back/pay-back.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ArticleModule } from './article/article.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
// consul配置
import { ConsulModule } from './consul/consul.module';
import { ConsulService } from './consul/consul.service';

const envFilePath = `.env.${process.env.NODE_ENV || 'prod'}`;

function atob(a) {
  if (!a) return;
  return Buffer.from(a, 'base64').toString('binary');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    //配置数据库链接
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get('DDD_HOST');
        const port = config.get('DDD_PORT');
        const username = config.get('DDD_USER');
        const password = atob(config.get('DDD_PD'));
        const database = config.get('DDD_NAME');

        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          // timezone: 'Z',
        } as TypeOrmModuleOptions;
      },
    }),
    // microservice 微服务
    ConsulModule.forRoot(),
    ScheduleModule.forRoot(),
    PayBackModule,
    AuthModule,
    UsersModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
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
