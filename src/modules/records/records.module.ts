import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';
import { DemoController } from './demo.controller';

@Module({
  controllers: [RecordsController, MetaController, DemoController],
  providers: [RecordsService, MetaService],
})
export class RecordsModule {}
