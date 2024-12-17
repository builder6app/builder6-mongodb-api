import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongodbModule } from '@builder6/core';
import { TablesModule } from '@/tables/tables.module';
import { AuthModule } from '@builder6/core';
import { SteedosModule } from './steedos/steedos.module';
import { RoomsModule } from './rooms/rooms.module';
import { FilesModule } from './files/files.module';
import { MoleculerModule } from '@builder6/moleculer';
import { Microsoft365Module } from './microsoft365/microsoft365.module';
import { OidcModule } from './oidc/oidc.module';
import { AppController } from './app.controller';
import { PluginModule } from './plugin/plugin.module';
import { EmailModule } from '@builder6/email';
import getConfig from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      load: [getConfig],
      isGlobal: true, // 使配置在整个应用中可用
    }),
    MoleculerModule.forRoot({
        brokerName: "builder6", // if you have multiple broker
        namespace: "steedos", // some moleculer options
        transporter: process.env.B6_TRANSPORTER,
        // hotReload: true, // hotReload feature from moleculer will not work 
    }),
    AuthModule,
    MongodbModule,
    SteedosModule,
    TablesModule,
    RoomsModule,
    FilesModule,
    Microsoft365Module,
    EmailModule,
    PluginModule.forRoot(),
    ...(process.env.B6_OIDC_ENABLED ? [OidcModule] : []),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
