import { Module } from '@nestjs/common';
import { NodeRedService } from './node-red/node-red.service';
import { NodeRedController } from './node-red/node-red.controller';
import { NodeRedMoleculer } from './node-red/node-red.moleculer';

@Module({
  providers: [NodeRedService, NodeRedMoleculer],
  controllers: [NodeRedController],
})
export default class NodeRedModule {}
