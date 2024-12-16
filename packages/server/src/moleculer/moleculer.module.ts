import { Module } from '@nestjs/common';
import { MoleculerService } from './moleculer.service';

@Module({
  providers: [MoleculerService],
})
export class MoleculerModule {}
