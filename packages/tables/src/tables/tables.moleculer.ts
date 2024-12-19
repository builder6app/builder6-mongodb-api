import { Service, Context, ServiceBroker } from 'moleculer';
import { Injectable } from '@nestjs/common';
import { InjectBroker } from '@builder6/moleculer';
import { TablesService } from './tables.service';

@Injectable()
export class TablesMoleculer extends Service {
  constructor(
    tablesService: TablesService,
    @InjectBroker() broker: ServiceBroker,
  ) {
    super(broker);

    this.parseServiceSchema({
      name: '@builder6/tables',
      settings: {},
      actions: {
        insertOne: this.insertOne,
        findOneAndUpdate: this.findOneAndUpdate,
        deleteMany: this.deleteMany,
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  serviceCreated() {}

  async serviceStarted() {}

  async serviceStopped() {}

  async insertOne(ctx: Context) {
    const { baseId, tableId, record } = ctx.params as any;
    const result = this.tablesService.recordInsertOne(baseId, tableId, record);
    return result;
  }

  async deleteMany(ctx: Context) {
    const { baseId, tableId, query } = ctx.params as any;
    const result = this.tablesService.recordDeleteMany(baseId, tableId, query);
    return result;
  }

  async findOneAndUpdate(ctx: Context) {
    const { baseId, tableId, query, record } = ctx.params as any;
    const result = this.tablesService.recordFindOneAndUpdate(
      baseId,
      tableId,
      query,
      record,
    );
    return result;
  }

  async find(ctx: Context) {
    const {
      baseId,
      tableId,
      options = {},
      processOptions = {},
    } = ctx.params as any;
    const { fields, filters, top, skip, sort } = options;

    const loadOptions = { take: top, skip: skip, filter: filters } as any;

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
    const result = this.tablesService.recordFind(
      baseId,
      tableId,
      loadOptions,
      processOptions,
    );
    return result;
  }
}
