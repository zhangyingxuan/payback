import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { HttpExceptionFilter } from './filters/HttpExceptionFilter';
import { getAvailablePort } from './portManager';
import { rateLimit } from 'express-rate-limit';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PayBackController } from '@/pay-back/pay-back.controller';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // message: '接口繁忙中，请稍后重试',
  handler: (req, res, next) => {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(429).json({
      code: 429,
      data: { message: '请求过于频繁，请稍后再试' },
      // data: 'Too many requests, please try again later.',
    });
    console.log(
      `Request from ${req.ip} - ${req.headers['x-real-ip']} - ${req.headers['x-forwarded-for']}; exceeded rate limit`,
    );
    // next();
  },
});

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

  // 通过依赖注入获取控制器实例
  const payBackController = app.get(PayBackController);
  payBackController.initSchedulerTask();

  //此接口NestExpressApplication才有
  app.set('trust proxy', true);

  // 全局路由前缀
  app.setGlobalPrefix('blowsysun');

  // 仅对权限模块限速
  app.use('/blowsysun/auth', limiter);
  app.use(compression());
  // 设置session
  app.use(
    session({
      secret: 'blowsysun',
      rolling: true,
      name: 'Mr.zhang',
      //确保没有初始化的情况下不保存会话
      saveUninitialized: false,
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
