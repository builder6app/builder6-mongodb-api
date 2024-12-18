import { Module } from '@nestjs/common';
import { TablesModule } from './tables/tables.module';

@Module({
  imports: [TablesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
