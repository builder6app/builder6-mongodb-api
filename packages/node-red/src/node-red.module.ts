import { Module } from '@nestjs/common';
import { NodeRedService } from './node-red.service';
import { NodeRedController } from './node-red.controller';

@Module({
  providers: [NodeRedService],
  controllers: [NodeRedController]
})
export class NodeRedModule {}
