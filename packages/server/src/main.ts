import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { HttpExceptionFilter } from './filters/HttpExceptionFilter';
import { getAvailablePort } from './portManager';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);
  // const app = await NestFactory.create(AppModule);
  app.set('trust proxy', true); //此接口NestExpressApplication才有
  app.use(compression());
  app.setGlobalPrefix('blowsysun'); // 全局路由前缀
  app.use(
    session({
      secret: 'blowsysun',
      rolling: true,
      name: 'Mr.zhang',
      saveUninitialized: false, //确保没有初始化的情况下不保存会话
      cookie: { secure: false },
    }),
  );
  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 示例用法
  const port: any = await getAvailablePort(3000);
  await app.listen(port);
}
bootstrap();
