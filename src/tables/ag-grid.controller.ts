import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('/api/tables/v2/ag-grid/')
export class AgGridController {
  @Get('ag-grid/:baseId/:tableId')
  @Render('ag-grid/ag-grid')
  async AgGrid(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
  ) {
    return {
      baseId,
      tableId,
    };
  }
}
