import { MongodbService } from '@/mongodb/mongodb.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getTableMeta(baseId: string, tableId: string) {
    let table = await this.mongodbService.findOne('b6_tables', {
      _id: tableId,
    });
    if (table) {
      table.fields = await this.mongodbService.find('b6_fields', {
        table_id: tableId,
      });
      table.verifications = await this.mongodbService.find('b6_verification', {
        table: tableId,
      });
    } else {
      table = {
        _id: tableId,
        base_id: baseId,
        name: 'Tasks',
        description: 'I was changed!',
        fields: [
          {
            _id: 'fld001',
            name: 'Name',
            type: 'text',
            default_value: '默认文本',
          },
          { _id: 'fld002', name: 'Age', type: 'number' },
          { _id: 'fld003', name: 'Discount', type: 'number', precision: 2 },
          { _id: 'fld004', name: 'Info', type: 'textarea' },
          {
            _id: 'fld005',
            name: 'Company',
            type: 'select',
            options: `华炎\n建华\n中国移动`,
          },
          // {
          //   _id: 'fld006',
          //   name: 'Citys',
          //   type: 'select-multiple',
          //   options: `上海\n北京\n南京\n杭州`,
          //   multiple: true,
          // },
          { _id: 'fld007', name: 'Birthdate', type: 'date' },
          // { _id: 'fld008', name: 'Created', type: 'datetime' },
          { _id: 'fld009', name: 'valid', type: 'boolean' },
          { _id: 'fld010', name: 'Formula', type: 'formula', formula: 'name + "sss"' },
        ],
        verifications: [
          {
            alert: '年龄必须大于18岁',
            rule: 'age > 18',
          },
        ],
      } as any;
    }
    return table;
  }
}
