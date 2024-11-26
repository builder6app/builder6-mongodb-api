import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaService {
  async getTableMeta(baseId: string, tableId: string) {
    return {
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
    };
  }
}
