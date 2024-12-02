import { MongodbService } from '@/mongodb/mongodb.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getTableMeta(baseId: string, tableId: string) {
    let table = await this.mongodbService.findOne('b6_tables', tableId);
    if (table) {
      table.fields = await this.mongodbService.find(
        'b6_fields',
        { table_id: tableId },
      );
    } else {
      table = {
        _id: tableId,
        base_id: baseId,
        name: 'Tasks',
        description: 'I was changed!',
        fields: [
          { _id: 'fld001', name: 'Name', type: 'text' },
          { _id: 'fld002', name: 'Company', type: 'text' },
          { _id: 'fld003', name: 'Age', type: 'number' },
          { _id: 'fld004', name: 'Created', type: 'datetime' },
          { _id: 'fld005', name: 'valid', type: 'boolean' },
        ],
      } as any;
    }
    return table;
  }
}
