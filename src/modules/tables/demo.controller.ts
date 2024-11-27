import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('/demo/')
export class DemoController {
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
