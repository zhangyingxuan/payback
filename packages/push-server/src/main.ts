import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { getAvailablePort } from './portManager';

async function bootstrap() {
  // 示例用法
  const port: any = await getAvailablePort(3001);
  console.log(`Server running on port ${port}`);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port,
      },
    },
  );
  await app.listen();
}
bootstrap();
