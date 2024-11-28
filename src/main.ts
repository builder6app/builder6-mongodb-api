import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TablesModule } from './tables/tables.module';
import { SteedosModule } from './steedos/steedos.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: function (origin, callback) {
      console.log('allowed cors for:', origin);
      callback(null, true);
    },
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Builder6 API')
    .setDescription('The Builder6 API description')
    .setVersion('2.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [TablesModule, SteedosModule],
    });
  SwaggerModule.setup('', app, documentFactory);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
