import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Res,
  Req,
  Query,
  ParseIntPipe,
  UseGuards,
  Render,
  Patch,
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { Request, Response } from 'express';
import { getOptions } from '@builder6/query-mongodb';
import {
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@builder6/core';
import { MetaService } from './meta.service';
import * as path from 'path';

// 兼容 Steedos OpenAPI v1 格式的 api
@Controller('b6/tables/')
@UseGuards(AuthGuard)
export class TablesAppController {

  @Get('')
  async Hello() {
    return 'Welcome to Builder6 Tables!';
  }

  @Get('devextreme/datagrid/:baseId/:tableId')
  async getDemo(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Res() res: Response
  ) {
    const absolutePath = path.resolve(__dirname, '../../views/devextreme/datagrid.hbs');

    res.render(absolutePath, {
      baseId,
      tableId,
    });
  }

  @Get('ag-grid/ag-grid/:baseId/:tableId')
  async AgGrid(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Res() res: Response
  ) {
    const absolutePath = path.resolve(__dirname, '../../views/ag-grid/ag-grid.hbs');

    res.render(absolutePath, {
      baseId,
      tableId,
    });
  }
}
