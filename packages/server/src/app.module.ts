import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PayBackModule } from './pay-back/pay-back.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

const envFilePath = `.env.${process.env.NODE_ENV || 'prod'}`;

function atob(a) {
  return Buffer.from(a, 'base64').toString('binary');
};

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
        return {
          type: 'mysql',
          host: config.get('DDD_HOST'),
          port: config.get('DDD_PORT'),
          username: config.get('DDD_USER'),
          password: atob(config.get('DDD_PD')),
          database: config.get('DDD_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        } as TypeOrmModuleOptions;
      },
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   // host: '43.154.209.141',
    //   // devCloud
    //   host: '9.134.243.217',
    //   port: 3306,
    //   username: 'root',
    //   password: '123',
    //   database: 'blowsysun',
    //   entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   synchronize: true,
    // }),
    PayBackModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ],
})
export class AppModule { configure(consumer: MiddlewareConsumer) { } }
