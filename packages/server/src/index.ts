import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { INestApplicationContext } from '@nestjs/common';

export let app: INestApplicationContext;

async function bootstrap() {
  app = await NestFactory.createApplicationContext(AppModule);
  await app.close();
}

bootstrap();
