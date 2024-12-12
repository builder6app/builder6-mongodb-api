import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller('/api/v6/tables/ag-grid/')
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
