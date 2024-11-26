import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MetaController } from './meta.controller';
import { MetaService } from './meta.service';

@Module({
  controllers: [RecordsController, MetaController],
  providers: [RecordsService, MetaService],
})
export class RecordsModule {}
