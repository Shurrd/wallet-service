import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');

  const port = process.env.APP_PORT;
  await app.listen(port as string);

  console.log(`🚀 App running on port: ${port}`);
}
bootstrap();
