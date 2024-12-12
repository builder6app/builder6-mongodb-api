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
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { MongodbService } from '../mongodb/mongodb.service';
import { Request, Response } from 'express';
import { getOptions } from 'devextreme-query-mongodb/options';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '@/auth/admin.guard';

// 直接操作 mongodb 数据库 的 API，必须是 admin 用户才能操作。
@Controller('api/v6/direct')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class MongodbController {
  constructor(private readonly mongodbService: MongodbService) {}

  @Post(':objectName')
  @ApiOperation({ summary: 'Create a record' })
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  async create(
    @Param('objectName') objectName: string,
    @Body() record: object,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req['user'];
    try {
      const result = await this.mongodbService.insertOne(objectName, {
        ...record,
        owner: user._id,
        created_by: user._id,
        created: new Date(),
        modified_by: user._id,
        modified: new Date(),
        space: user.space,
      });
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Get(':objectName')
  @ApiOperation({ summary: 'List records' })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: '查询的字段，示例：name,created',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: '过滤条件，示例：["age", ">", 10]',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: '排序，示例：created desc',
  })
  @ApiQuery({ name: 'skip', required: false, description: '跳过记录数' })
  @ApiQuery({
    name: 'top',
    required: false,
    description: '每页记录数，默认20',
  })
  async find(
    @Param('objectName') objectName: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('fields') fields?: any,
    @Query('filters') filters?: any,
    @Query('sort') sort?: any,
    @Query('skip', new ParseIntPipe()) skip: number = 0,
    @Query('top', new ParseIntPipe()) top: number = 20,
  ) {
    try {
      const options = getOptions(req.query, {
        areaKM2: 'int',
        population: 'int',
      });

      const loadOptions = { take: top, skip: skip, ...options.loadOptions };
      if (filters) {
        loadOptions.filter = JSON.parse(filters);
      }
      if (sort) {
        const sortFields = sort.split(',');
        loadOptions.sort = sortFields.map((sortField) => {
          const [field, dir] = sortField.split(' ');
          return { selector: field, desc: dir === 'desc' };
        });
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
  @ApiOperation({ summary: 'Get record' })
  async findOne(
    @Res() res: Response,
    @Param('objectName') objectName: string,
    @Param('id') id: string,
  ) {
    try {
      const result = await this.mongodbService.findOne(objectName, {
        _id: id,
      });
      if (!result) {
        return res.status(404).send();
      }
      res.status(200).send(result);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  @Patch(':objectName/:id')
  @ApiOperation({ summary: 'Update record' })
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  async update(
    @Param('objectName') objectName: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.findOneAndUpdate(
        objectName,
        id,
        {
          ...body,
          modified_by: req['user']._id,
          modified: new Date(),
        },
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


  @Patch(':objectName')
  @ApiOperation({ summary: 'Update multiple records' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        records: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: 'rec560UJdUtocSouk' },
            },
            required: ['_id'], // 根据需要设置必填字段
          },
        },
      },
    },
  })
  async updateMultiple(
    @Param('objectName') objectName: string,
    @Body('records') records: object[],
    @Body('performUpsert') performUpsert: boolean,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (performUpsert) {
        
        const createdRecords = [];
        const updatedRecords = [];
        const resultRecords = [];
        for (const record of records) {
          const { _id, ...rest } = record as any;
          if (_id) {
            const result = await this.mongodbService.findOneAndUpdate(
              objectName,
              _id,
              {
                ...rest,
                modified_by: req['user']._id,
                modified: new Date(),
              },
            );
            if (!result) {  
              throw new Error(`Record not found ${_id}`);
            }
              
            updatedRecords.push(result._id);
            resultRecords.push(result);
          } else {

            const result = await this.mongodbService.insertOne(
              objectName,
              {
                ...rest,
                created_by: req['user']._id,
                created: new Date(),
                modified_by: req['user']._id,
                modified: new Date(),
              },
            );
            createdRecords.push(result._id);
            resultRecords.push(result);
          }
          res.status(200).send({
            createdRecords,
            updatedRecords,
            records: resultRecords,
          });
        }
          
      } else {

        const resultRecords = [];
        for (const record of records) {
          const { _id, ...rest } = record as any;
          if (!_id) {  
            throw new Error(`_id is required`);
          }
          if (_id) {
            const result = await this.mongodbService.findOneAndUpdate(
              objectName,
              _id,
              {
                ...rest,
                modified_by: req['user']._id,
                modified: new Date(),
              },
            );
            if (!result) {  
              throw new Error(`Record not found ${_id}`);
            }
            resultRecords.push(result);
          }
          res.status(200).send({
            records: resultRecords,
          });
        }
      }
    } catch (error) {
      console.error('Update error', error);
      res.status(500).send(error);
    }
  }

  @Delete(':objectName/:id')
  @ApiOperation({ summary: 'Delete record' })
  async remove(
    @Param('objectName') objectName: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.deleteOne(objectName, {_id: id});
      if (result.deletedCount === 0) {
        return res.status(404).send();
      }
      res.status(200).send({ deleted: true, _id: id });
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }

  /* 返回 {
    "records": [
      {
        "deleted": true,
        "_id": "rec560UJdUtocSouk"
      },
      {
        "deleted": true,
        "_id": "rec3lbPRG4aVqkeOQ"
      }
    ]
  } */
  @Delete(':objectName')
  @ApiOperation({ summary: 'Delete multiple records' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        records: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  async deleteMultiple(
    @Param('objectName') objectName: string,
    @Body('records') records: [string],
    @Res() res: Response,
  ) {
    try {
      const result = await this.mongodbService.deleteMany(objectName, {_id: { $in: records }});
      if (result.deletedCount === 0) {
        return res.status(404).send();
      }
      res.status(200).send({ records: records.map(_id => ({ deleted: true, _id })) });
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }
}