import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { MetaService } from './meta.service';
import { MetaController } from './meta.controller';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { AuthModule } from '@/auth/auth.module';
import { DemoController } from './demo.controller';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [RecordsController, MetaController, DemoController],
  providers: [MetaService, RecordsService],
})
export class TablesModule {}
