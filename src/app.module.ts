import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongodbModule } from '@/mongodb/mongodb.module';
import { TablesModule } from '@/tables/tables.module';
import { AuthModule } from './auth/auth.module';
import { SteedosModule } from './steedos/steedos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true, // 使配置在整个应用中可用
    }),
    MongodbModule,
    SteedosModule,
    TablesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
