/*
 * @Author: 殷亮辉 yinlianghui@hotoa.com
 * @Date: 2024-12-13 18:43:25
 * @LastEditors: 殷亮辉 yinlianghui@hotoa.com
 * @LastEditTime: 2024-12-14 11:02:46
 */
import { MongodbService } from '@builder6/core';
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
          { _id: 'fld009', name: 'valid', label: '启用', type: 'boolean' },
          {
            _id: 'fld010',
            name: 'formula',
            label: '公式',
            type: 'formula',
            formula: 'name + age',
          },
          {
            _id: 'owner',
            name: 'owner',
            label: '所有者',
            type: 'lookup',
            reference_to: 'users',
          },
          {
            _id: 'created',
            name: 'created',
            label: '创建日期',
            type: 'datetime',
          },
          {
            _id: 'created_by',
            name: 'created_by',
            label: '创建人',
            type: 'lookup',
            reference_to: 'users',
          },
          {
            _id: 'modified',
            name: 'modified',
            label: '修改日期',
            type: 'datetime',
          },
          {
            _id: 'modified_by',
            name: 'modified_by',
            label: '修改人',
            type: 'lookup',
            reference_to: 'users',
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
