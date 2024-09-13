import { Module, MiddlewareConsumer } from '@nestjs/common';
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
        console.log(config.get('DDD_HOST'), config.get('DDD_NAME'), process.env.NODE_ENV);
        const host = config.get('DDD_HOST') || '127.0.0.1';
        const port = config.get('DDD_PORT') || 3306;
        const username = config.get('DDD_USER') || 'root';
        const password = atob(config.get('DDD_PD') || 'anVlZHVpYW5xdWFuOTk2');
        const database = config.get('DDD_NAME') || 'blowsysun';

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
export class AppModule {
  configure(consumer: MiddlewareConsumer) { }
}
