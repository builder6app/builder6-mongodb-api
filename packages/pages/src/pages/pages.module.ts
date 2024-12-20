import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { LiquidService } from './liquid.service';

@Module({
  providers: [PagesService, LiquidService],
  controllers: [PagesController]
})
export class PagesModule {}
