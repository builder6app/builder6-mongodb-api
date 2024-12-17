import { Module } from '@nestjs/common';
import { MongodbController } from './mongodb.controller';
import { MongodbModule } from '@builder6/core';
import { AuthModule } from '@builder6/core';
import { ObjectService } from './object.service';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [MongodbController],
  providers: [ObjectService],
})
export class SteedosModule {}
