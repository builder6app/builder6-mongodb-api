import { Controller, Get, Param, Render } from '@nestjs/common';
import { MetaService } from './meta.service';

@Controller('/demo/')
export class DemoController {
  constructor(private readonly metaService: MetaService) {}

  @Get('grid/:baseId/:tableId')
  @Render('demo/grid')
  async getDemo(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
  ) {
    return {
      baseId,
      tableId,
    };
  }
}
