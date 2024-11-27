import { Module } from '@nestjs/common';
import { MongodbService } from './mongodb.service';

@Module({
  controllers: [],
  providers: [MongodbService],
  exports: [MongodbService],
})
export class SteedosModule {}
