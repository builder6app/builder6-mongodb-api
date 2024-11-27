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
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { Request, Response } from 'express';
import { getOptions } from 'devextreme-query-mongodb/options';

// 兼容 Steedos OpenAPI v1 格式的 api
@Controller('tables/v2/')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post(':baseId/:tableId')
  async create(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.createTableEntry(
        baseId,
        tableId,
        body,
      );
      res.status(201).send(result._id);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

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
      const results = await this.recordsService.getTableEntries(
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

  @Get(':baseId/:tableId/:id')
  async findOne(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.getTableEntryById(
        baseId,
        tableId,
        id,
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

  @Put(':baseId/:tableId/:id')
  async update(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.updateTableEntry(
        baseId,
        tableId,
        id,
        body,
      );
      console.log('result', result, baseId, tableId, id, body);
      if (!result) {
        return res.status(404).send();
      }
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Delete(':baseId/:tableId/:id')
  async remove(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.deleteTableEntry(
        baseId,
        tableId,
        id,
      );
      if (result.deletedCount === 0) {
        return res.status(404).send();
      }
      res.status(200).send({ message: 'Item deleted' });
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }
}
