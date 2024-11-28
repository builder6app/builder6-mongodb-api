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
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { Request, Response } from 'express';
import { getOptions } from 'devextreme-query-mongodb/options';
import { ApiBody } from '@nestjs/swagger';

// 兼容 Steedos OpenAPI v1 格式的 api
@Controller('api/tables/v2/')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post(':baseId/:tableId')
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  async create(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Body() record: object,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.createRecord(
        baseId,
        tableId,
        record,
      );
      console.log(result);
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  // loadOptions: https://github.com/oliversturm/devextreme-query-mongodb/wiki/loadOptions
  @Get(':baseId/:tableId')
  async findAll(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const options = getOptions(req.query, {
        areaKM2: 'int',
        population: 'int',
      });

      const loadOptions = { take: 20, skip: 0, ...options.loadOptions };
      const processingOptions = {
        replaceIds: false,
        ...options.processingOptions,
      };
      const results = await this.recordsService.getRecords(
        baseId,
        tableId,
        loadOptions,
        processingOptions,
      );
      res.status(200).send(results);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  // 兼容 amis 格式的数据返回接口
  @Get(':baseId/:tableId/amis')
  async amisFind(
    @Res() res: Response,
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('perPage', ParseIntPipe) perPage: number = 10,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: string,
    @Query('filters') filters?: any,
  ) {
    try {
      const loadOptions = {
        take: perPage,
        skip: ((page as number) - 1) * (perPage as number),
        requireTotalCount: true,
      } as any;
      if (orderBy) {
        loadOptions.sort = [{ selector: orderBy, desc: orderDir === 'desc' }];
      }
      if (filters) {
        loadOptions.filters = filters;
      }
      const processingOptions = {
        replaceIds: false,
      };
      const results = await this.recordsService.getRecords(
        baseId,
        tableId,
        loadOptions,
        processingOptions,
      );
      console.log(loadOptions, results);
      res.status(200).send({
        status: 0,
        msg: '',
        data: {
          items: results.data,
          count: results.totalCount,
        },
      });
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Get(':baseId/:tableId/:recordId')
  async findOne(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('recordId') recordId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.getRecordById(
        baseId,
        tableId,
        recordId,
      );
      if (!result) {
        return res.status(404).send();
      }
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Put(':baseId/:tableId/:recordId')
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  async update(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('recordId') recordId: string,
    @Body() body: object,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.updateRecord(
        baseId,
        tableId,
        recordId,
        body,
      );
      if (!result) {
        return res.status(404).send();
      }
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Delete(':baseId/:tableId/:recordId')
  async remove(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('recordId') recordId: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.deleteRecord(
        baseId,
        tableId,
        recordId,
      );
      if (result.deletedCount === 0) {
        return res.status(404).send();
      }
      res.status(200).send({ deleted: true, _id: recordId });
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }
}
