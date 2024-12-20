import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import { urlencoded, json } from 'express';
import { WsAdapter } from '@nestjs/platform-ws';

import * as session from 'express-session';
import * as project from '../package.json';

export default async function ExpressApplication() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  app.use(
    session({
      secret: 'your_session_secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Builder6 API')
    .setDescription('The Builder6 API description')
    .setVersion(project.version)
    .addBearerAuth()
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/v6', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setViewEngine('hbs');

  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));
  app.use(
    urlencoded({ extended: true, limit: '100mb', parameterLimit: 1000000 }),
  );
  app.use(compression());

  return app;
}
