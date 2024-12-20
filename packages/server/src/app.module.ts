import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongodbModule } from '@builder6/core';
import { TablesModule } from '@builder6/tables';
import { AuthModule } from '@builder6/core';
import { SteedosModule } from './steedos/steedos.module';
import { RoomsModule } from '@builder6/rooms';
import { FilesModule } from '@builder6/core';
import { MoleculerModule } from '@builder6/moleculer';
import { Microsoft365Module } from './microsoft365/microsoft365.module';
import { OidcModule } from './oidc/oidc.module';
import { AppController } from './app.controller';
import { PluginModule } from '@builder6/core';
import { EmailModule } from '@builder6/email';
import { PagesModule } from '@builder6/pages';
import { getConfigs, getDbConfigs, getMoleculerConfigs } from '@builder6/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfigs, getDbConfigs],
      isGlobal: true, // 使配置在整个应用中可用
    }),
    MoleculerModule.forRoot({
        // brokerName: "builder6", // if you have multiple broker
        namespace: "steedos", // some moleculer options
        transporter: process.env.B6_TRANSPORTER,
        // hotReload: true, // hotReload feature from moleculer will not work 
        ...getMoleculerConfigs(),
    }),
    AuthModule,
    MongodbModule,
    SteedosModule,
    FilesModule,
    EmailModule,
    TablesModule,
    PagesModule,
    RoomsModule,
    Microsoft365Module,
    OidcModule,
    PluginModule.forRootAsync(),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
