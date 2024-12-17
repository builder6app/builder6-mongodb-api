import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { RecordsService } from './records.service';
import { MetaService } from './meta.service';
import { MongodbModule } from '@builder6/common';
import { AuthModule } from '@builder6/common';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [TablesController],
  providers: [MetaService, RecordsService],
})
export class TablesModule {}
