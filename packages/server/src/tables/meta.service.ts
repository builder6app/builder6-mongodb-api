/*
 * @Author: 殷亮辉 yinlianghui@hotoa.com
 * @Date: 2024-12-13 18:43:25
 * @LastEditors: 殷亮辉 yinlianghui@hotoa.com
 * @LastEditTime: 2024-12-14 11:02:46
 */
import { MongodbService } from '@builder6/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getTableMeta(baseId: string, tableId: string) {
    let table = await this.mongodbService.findOne('b6_tables', {
      _id: tableId,
    });
    if (table) {
      table.fields = await this.mongodbService.find(
        'b6_fields',
        {
          table_id: tableId,
        },
        { sort: { sort_no: 1 } },
      );
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
            name: 'name',
            label: '名称',
            type: 'text',
            default_value: '默认文本',
          },
          {
            _id: 'fld002',
            name: 'age',
            label: '年龄',
            type: 'number',
            default_value: 20,
          },
          {
            _id: 'fld003',
            name: 'discount',
            label: '折扣',
            type: 'number',
            precision: 2,
          },
          { _id: 'fld004', name: 'info', label: '备注', type: 'textarea' },
          {
            _id: 'fld005',
            name: 'company',
            label: '公司',
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
          { _id: 'fld007', name: 'birthdate', label: '生日', type: 'date' },
          {
            _id: 'fld008',
            name: 'created',
            label: '创建时间',
            type: 'datetime',
            default_value: '2024-12-11T09:22:09.045Z',
          },
          { _id: 'fld009', name: 'valid', label: '启用', type: 'boolean' },
          {
            _id: 'fld010',
            name: 'formula',
            label: '公式',
            type: 'formula',
            formula: 'name + age',
          },
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
