import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongodbModule } from '@/mongodb/mongodb.module';
import { TablesModule } from '@/tables/tables.module';
import { AuthModule } from './auth/auth.module';
import { SteedosModule } from './steedos/steedos.module';
import { RoomsModule } from './rooms/rooms.module';
import { FilesModule } from './files/files.module';
import { MoleculerModule } from './moleculer/moleculer.module';
import { Microsoft365Module } from './microsoft365/microsoft365.module';
import { OidcModule } from './oidc/oidc.module';
import { AppController } from './app.controller';
import { PluginModule } from './plugin/plugin.module';
import config from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      load: [config],
      isGlobal: true, // 使配置在整个应用中可用
    }),
    AuthModule,
    MongodbModule,
    SteedosModule,
    TablesModule,
    RoomsModule,
    FilesModule,
    MoleculerModule,
    Microsoft365Module,
    PluginModule.forRoot(),
    ...(process.env.B6_OIDC_ENABLED ? [OidcModule] : []),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
