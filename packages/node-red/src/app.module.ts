import { Module } from '@nestjs/common';
import { NodeRedService } from './node-red.service';
import { NodeRedController } from './node-red.controller';
import { NodeRedMoleculer } from './node-red.moleculer';

@Module({
  providers: [NodeRedService, NodeRedMoleculer],
  controllers: [NodeRedController],
})
export default class NodeRedModule {}
