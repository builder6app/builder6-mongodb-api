import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MetaController } from './meta.controller';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@/auth/auth.guard';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [RecordsController, MetaController],
  providers: [
    RecordsService,
  ],
})
export class TablesModule {}
