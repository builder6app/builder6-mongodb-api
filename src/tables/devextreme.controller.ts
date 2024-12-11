import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('/api/v6/tables/devextreme/')
export class DevExtremeController {
  @Get('datagrid/:baseId/:tableId')
  @Render('devextreme/datagrid')
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
