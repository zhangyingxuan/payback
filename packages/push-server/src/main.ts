import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
// import { getAvailablePort } from './portManager';

async function bootstrap() {
  const port: any = 3001; // await getAvailablePort(3001);
  console.log(`Server running on port ${port}`);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        // host: '0.0.0.0',
        port,
      },
    },
  );
  await app.listen();
}
bootstrap();
