import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { urlencoded, json } from 'express';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Builder6 API')
    .setDescription('The Builder6 API description')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.use(
    urlencoded({ extended: true, limit: '100mb', parameterLimit: 1000000 }),
  );
  app.use(compression());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
