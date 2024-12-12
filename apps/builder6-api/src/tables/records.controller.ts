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
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { Request, Response } from 'express';
import { getOptions } from 'devextreme-query-mongodb/options';
import { ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@/auth/auth.guard';

// 兼容 Steedos OpenAPI v1 格式的 api
@Controller('api/v6/tables/')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  /**
   * Create a new record
   *
   * @remarks This operation allows you to create a new record.
   *
   */
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req['user'];
    try {
      const result = await this.recordsService.createRecord(baseId, tableId, {
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

  // loadOptions: https://github.com/oliversturm/devextreme-query-mongodb/wiki/loadOptions
  @Get(':baseId/:tableId')
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
    @Req() req: Request,
    @Res() res: Response,
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
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
  @ApiQuery({
    name: 'page',
    required: false,
    description: '当前页码，从1开始。',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: '每页记录数，默认20',
  })
  @ApiQuery({ name: 'orderBy', required: false, description: '排序字段' })
  @ApiQuery({
    name: 'orderDir',
    required: false,
    description: '排序顺序',
    enum: ['asc', 'desc'],
  })
  async amisFind(
    @Res() res: Response,
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Query('fields') fields?: any,
    @Query('filters') filters?: any,
    @Query('sort') sort?: any,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: string,
    @Query('page', new ParseIntPipe()) page: number = 1,
    @Query('perPage', new ParseIntPipe())
    perPage: number = 10,
  ) {
    try {
      const take = perPage ? perPage : 10;
      const skip = (page - 1) * perPage;
      const loadOptions = {
        take,
        skip,
        requireTotalCount: true,
      } as any;
      if (orderBy) {
        loadOptions.sort = [{ selector: orderBy, desc: orderDir === 'desc' }];
      }
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
      };
      const results = await this.recordsService.getRecords(
        baseId,
        tableId,
        loadOptions,
        processingOptions,
      );
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const record = {
        ...body,
        modified_by: req['user']._id,
        modified: new Date(),
      };
      const result = await this.recordsService.updateRecord(
        baseId,
        tableId,
        recordId,
        record,
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
      const result = await this.recordsService.deleteOne(
        baseId,
        tableId,
        {_id: recordId},
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

  /* 
  Body: {records: ['rec560UJdUtocSouk', 'rec3lbPRG4aVqkeOQ']}
  Response: {
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
  @Delete(':objectName')
  async deleteMultiple(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Body('records') records: [string],
    @Res() res: Response,
  ) {
    try {
      const result = await this.recordsService.deleteMany(
        baseId,
        tableId, {_id: { $in: records }});
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
