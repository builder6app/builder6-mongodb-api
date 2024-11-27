import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { MongodbService } from './mongodb.service';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { DemoController } from './demo.controller';

@Module({
  controllers: [RecordsController, MetaController, DemoController],
  providers: [MongodbService, MetaService],
})
export class TablesModule {}
