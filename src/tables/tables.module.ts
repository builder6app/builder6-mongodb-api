import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { AuthModule } from '@/auth/auth.module';
import { DevExtremeController } from './devextreme.controller';
import { AgGridController } from './ag-grid.controller';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [
    RecordsController,
    MetaController,
    DevExtremeController,
    AgGridController,
  ],
  providers: [MetaService, RecordsService],
})
export class TablesModule {}
