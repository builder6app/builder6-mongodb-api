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
import { getConfigs, getDbConfigs, getMoleculerConfigs } from '@builder6/core';
import { LiquidService } from './liquid.service';

// 兼容 Steedos OpenAPI v1 格式的 api
@Controller('b6/tables/')
@UseGuards(AuthGuard)
export class TablesAppController {

  constructor(private readonly liquidService: LiquidService) {}

  @Get('')
  async Hello() {
    return 'Welcome to Builder6 Tables!';
  }

  @Get('grid/:baseId/:tableId')
  async getDemo(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Res() res: Response
  ) {
    const config = getConfigs();
    try {
      const rendered = await this.liquidService.render('grid', {
        baseId,
        tableId,
        config,
      });

      res.status(200).send(rendered); // 返回渲染后的字符串
    } catch (error) {
      console.log(error)
      return { error: 'Template rendering failed', details: error.message };
    }
  }

  @Get('ag-grid/:baseId/:tableId')
  async AgGrid(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Res() res: Response
  ) {
    
    const config = getConfigs();
    try {
      const rendered = await this.liquidService.render('ag-grid', {
        baseId,
        tableId,
        config,
      });

      res.status(200).send(rendered); // 返回渲染后的字符串
    } catch (error) {
      console.log(error)
      return { error: 'Template rendering failed', details: error.message };
    }
  }
}
