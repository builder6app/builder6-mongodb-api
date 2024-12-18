import 'regenerator-runtime/runtime';

import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { queryGroups, querySimple } from '@builder6/query-mongodb';
import { ConfigService } from '@nestjs/config';
import * as DataLoader from 'dataloader';
import { MongodbService } from '@builder6/core';

@Injectable()
export class TablesService {
  private db: Db;
  private loaders: Map<string, any> = new Map();
  private readonly logger = new Logger(TablesService.name);

  constructor(
    private configService: ConfigService,
    private readonly mongodbService: MongodbService,
  ) {
    const mongoUrl =
      configService.get('tables.mongo.url') || configService.get('mongo.url');

    const client = new MongoClient(mongoUrl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    client
      .connect()
      .then(() => {
        this.db = client.db();
        this.logger.log('Connected to Tables MongoDB');
      })
      .catch((err) => {
        this.logger.error('Error connecting to Tables MongoDB', err);
      });
  }

  public getCollection(baseId: string, tableId: string): Collection {
    const collectionName = `t_${baseId}_${tableId}`;
    return this.db.collection(collectionName);
  }

  async createRecord(baseId: string, tableId, data: any) {
    const collection = this.getCollection(baseId, tableId);
    const entry = { _id: uuidv4(), ...data };
    await collection.insertOne(entry);
    return entry;
  }

  async getRecords(
    baseId: string,
    tableId: string,
    loadOptions: any,
    processingOptions: any,
  ) {
    const collection = this.getCollection(baseId, tableId);
    const result = await querySimple(collection, loadOptions, {
      replaceIds: false,
      ...processingOptions,
    });
    const records = result.data;

    const expands = loadOptions?.expands || [];
    console.log('query expand fields', expands);

    // 循环 expands，获取关联表数据
    for (const expand of expands) {
      const { reference_to } = await this.getTableField(
        baseId,
        tableId,
        expand,
      );
      console.log('query expand fields', expand, reference_to);
      if (reference_to) {
        const loader = await this.getMongodbDataLoader(reference_to, [
          '_id',
          'name',
        ]);
        for (const record of records) {
          if (record[expand]) {
            const expandedRecord = (await loader.load(record[expand])) || {
              _id: expand,
            };
            console.log('expandedRecord', expand, expandedRecord);
            record[expand] = expandedRecord;
          }
        }
      }
    }
    return {
      ...result,
      data: records,
    };
  }

  async find(
    baseId: string,
    tableId: string,
    query: object,
    options: object = {},
  ) {
    const collection = this.getCollection(baseId, tableId);
    return await collection.find(query, options).toArray();
  }

  async findOne(baseId: string, tableId: string, query: object) {
    const collection = this.getCollection(baseId, tableId);
    return await collection.findOne(query);
  }

  async updateRecord(baseId: string, tableId: string, id: string, data: any) {
    const collection = this.getCollection(baseId, tableId);
    const result = await collection.findOneAndUpdate(
      { _id: id as any },
      { $set: data },
      { returnDocument: 'after' },
    );
    return result.value;
  }

  async deleteOne(baseId: string, tableId: string, query: object) {
    const collection = this.getCollection(baseId, tableId);
    const result = await collection.deleteOne(query);
    return result;
  }

  async deleteMany(baseId: string, tableId: string, query: object) {
    const collection = this.getCollection(baseId, tableId);
    const result = await collection.deleteMany(query);
    return result;
  }

  async getMongodbDataLoader(
    collectionName,
    fields: string[] = ['_id', 'name'],
  ) {
    if (this.loaders.has(collectionName)) {
      return this.loaders.get(collectionName);
    }
    // fields 转为 mongodb projection 对象
    const fieldsProjection = fields.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {});

    const loader = new DataLoader(async (ids: string[]) => {
      const records = await this.mongodbService.find(
        collectionName,
        {
          _id: {
            $in: ids,
          },
        },
        {
          projection: fieldsProjection,
        },
      );

      const result = ids.map((id) =>
        records.find((record: any) => record._id === id),
      );
      return result;
    });
    this.loaders.set(collectionName, loader);
    return loader;
  }

  async getTableField(baseId, tableId, fieldName) {
    if (fieldName === 'created_by' || fieldName === 'modified_by') {
      return {
        type: 'lookup',
        name: fieldName,
        reference_to: 'users',
      };
    }

    return {
      name: fieldName,
      reference_to: null,
    };
  }
}
