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
import { MongodbService } from './mongodb.service';
import { Request, Response } from 'express';
import { getOptions } from 'devextreme-query-mongodb/options';

// 直接操作 mongodb 数据库 的 API，必须是 admin 用户才能操作。
@Controller('mongodb/v2/')
export class MongodbController {
  constructor(private readonly mongodbService: MongodbService) {}

  @Post(':objectName')
  async create(
    @Param('objectName') objectName: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.createRecord(objectName, body);
      res.status(201).send(result._id);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Get(':objectName')
  async findAll(
    @Param('objectName') objectName: string,
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
      const results = await this.mongodbService.getRecords(
        objectName,
        loadOptions,
        processingOptions,
      );
      res.status(200).send(results);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Get(':objectName/:id')
  async findOne(
    @Param('objectName') objectName: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.getRecordById(objectName, id);
      if (!result) {
        return res.status(404).send();
      }
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Put(':objectName/:id')
  async update(
    @Param('objectName') objectName: string,
    @Param('id') id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.updateRecord(
        objectName,
        id,
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

  @Delete(':objectName/:id')
  async remove(
    @Param('objectName') objectName: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.deleteRecord(objectName, id);
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
