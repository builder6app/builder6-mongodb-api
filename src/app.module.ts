import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { TablesModule } from '@/tables/tables.module';
import { AuthModule } from './auth/auth.module';
import { DataModule } from './data/data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true, // 使配置在整个应用中可用
    }),
    MongodbModule,
    DataModule,
    TablesModule,
    AuthModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
