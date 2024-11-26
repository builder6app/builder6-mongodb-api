import { Controller, Get, Param, Res, Render } from '@nestjs/common';
import { MetaService } from './meta.service';
import { Response } from 'express';

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
