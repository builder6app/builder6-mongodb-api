import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('/api/tables/v2/devextreme/')
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
