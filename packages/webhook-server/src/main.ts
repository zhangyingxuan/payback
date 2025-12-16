import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: false, // 改为 false 允许额外属性
  //   transform: true, // 自动转换类型
  //   skipMissingProperties: true, // 跳过缺失属性
  // }));

  const port = process.env.APP_PORT || 3002;
  await app.listen(port);
  Logger.log(`🚀 Webhook server running on http://localhost:${port}`, 'Bootstrap');
}
bootstrap();