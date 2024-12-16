import { Module } from '@nestjs/common';
import { NodeRedService } from './node-red.service';

@Module({
  providers: [NodeRedService],
  controllers: []
})
export default class NodeRedModule {}
