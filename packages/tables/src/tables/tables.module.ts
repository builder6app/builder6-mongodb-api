import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { MetaService } from './meta.service';
import { MongodbModule } from '@builder6/core';
import { AuthModule } from '@builder6/core';
import { TablesMoleculer } from './tables.moleculer';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [TablesController],
  providers: [MetaService, TablesService, TablesMoleculer],
})
export class TablesModule {}
