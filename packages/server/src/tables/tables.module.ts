import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { RecordsService } from './records.service';
import { MetaService } from './meta.service';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [TablesController],
  providers: [MetaService, RecordsService],
})
export class TablesModule {}
