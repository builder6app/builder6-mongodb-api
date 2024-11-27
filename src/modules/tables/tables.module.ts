import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MetaController } from './meta.controller';
import { DemoController } from './demo.controller';
import { SteedosModule } from '../steedos/steedos.module';

@Module({
  imports: [SteedosModule],
  controllers: [RecordsController, MetaController, DemoController],
  providers: [RecordsService],
})
export class TablesModule {}
