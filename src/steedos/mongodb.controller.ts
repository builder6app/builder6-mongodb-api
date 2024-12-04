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
  UseGuards,
} from '@nestjs/common';
import { MongodbService } from '../mongodb/mongodb.service';
import { Request, Response } from 'express';
import { getOptions } from 'devextreme-query-mongodb/options';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '@/auth/admin.guard';

// 直接操作 mongodb 数据库 的 API，必须是 admin 用户才能操作。
@Controller('api/steedos/v6/direct')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class MongodbController {
  constructor(private readonly mongodbService: MongodbService) {}

  @Post(':objectName')
  async create(
    @Param('objectName') objectName: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.insertOne(objectName, body);
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Get(':objectName')
  async find(
    @Param('objectName') objectName: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('fields') fields?: any,
    @Query('filters') filters?: any,
  ) {
    try {
      const options = getOptions(req.query, {
        areaKM2: 'int',
        population: 'int',
      });

      const loadOptions = { take: 20, skip: 0, ...options.loadOptions };

      if (filters) {
        try {
          loadOptions.filter = JSON.parse(loadOptions.filters as string);
        } catch {}
      }

      if (fields) {
        try {
          loadOptions.select = JSON.parse(fields);
        } catch {
          loadOptions.select = fields.split(',');
        }
      }

      const processingOptions = {
        replaceIds: false,
        ...options.processingOptions,
      };
      const results = await this.mongodbService.objectqlFind(
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
    @Res() res: Response,
    @Param('objectName') objectName: string,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.mongodbService.objectqlFindOne(objectName, id);
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
      const result = await this.mongodbService.findOneAndUpdate(
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
      const result = await this.mongodbService.deleteOne(objectName, id);
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
