import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { MetaService } from './meta.service';
import { MongodbModule } from '@builder6/core';
import { AuthModule } from '@builder6/core';
import { TablesMoleculer } from './tables.moleculer';
import { TablesAppController } from './app.controller';
import { LiquidService } from './liquid.service';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [TablesController, TablesAppController],
  providers: [MetaService, TablesService, TablesMoleculer, LiquidService],
})
export class TablesModule {}
