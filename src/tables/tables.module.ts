import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MetaController } from './meta.controller';
import { DemoController } from './demo.controller';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@/auth/auth.guard';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [RecordsController, MetaController, DemoController],
  providers: [
    RecordsService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class TablesModule {}
