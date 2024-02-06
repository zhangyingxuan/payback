import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/HttpExceptionFilter';
import { getAvailablePort } from './utils/portManager';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  app.setGlobalPrefix('blowsysun'); // 全局路由前缀
  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  // 示例用法
  const port: any = await getAvailablePort(3001);

  await app.listen(port);
}
bootstrap();
