import 'regenerator-runtime/runtime';

import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { querySimple } from '@builder6/query-mongodb';
import { ConfigService } from '@nestjs/config';
import * as DataLoader from 'dataloader';
import { MongodbService } from '@builder6/core';
import { MetaService } from './meta.service';

@Injectable()
export class TablesService {
  private db: Db;
  private loaders: Map<string, any> = new Map();
  private readonly logger = new Logger(TablesService.name);

  constructor(
    private configService: ConfigService,
    private readonly mongodbService: MongodbService,
    private readonly metaService: MetaService,
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

  async insertOne(baseId: string, tableId, data: any) {
    const collection = this.getCollection(baseId, tableId);
    const entry = { _id: uuidv4(), ...data };
    await collection.insertOne(entry);
    return entry;
  }

  async recordInsertOne(baseId: string, tableId, record: any) {
    const lookupFields = await this.getTableLookupFields(baseId, tableId);
    await this.roolbackRecordLookupFields(record, lookupFields);

    const recordInserted = await this.insertOne(baseId, tableId, record);
    await this.convertRecordLookupFields(recordInserted, lookupFields);
    return recordInserted;
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

  async recordFind(
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

    const lookupFields = await this.getTableLookupFields(baseId, tableId);

    for (const record of records) {
      await this.convertRecordLookupFields(record, lookupFields);
    }

    // const expands = loadOptions?.expands || [];

    // // 循环 expands，获取关联表数据
    // for (const expand of expands) {
    //   const { reference_to } = await this.getTableField(
    //     baseId,
    //     tableId,
    //     expand,
    //   );
    //   if (reference_to) {
    //     const loader = await this.getMongodbDataLoader(reference_to, [
    //       '_id',
    //       'name',
    //     ]);
    //     for (const record of records) {
    //       if (record[expand]) {
    //         const expandedRecord = (await loader.load(record[expand])) || {
    //           _id: expand,
    //         };
    //         record[expand] = expandedRecord;
    //       }
    //     }
    //   }
    // }
    return {
      ...result,
      data: records,
    };
  }

  async findOne(baseId: string, tableId: string, query: object) {
    const collection = this.getCollection(baseId, tableId);
    return await collection.findOne(query);
  }

  async recordFindOne(baseId: string, tableId: string, query: object) {
    const record = await this.findOne(baseId, tableId, query);
    await this.convertRecordLookupFields(
      record,
      await this.getTableLookupFields(baseId, tableId),
    );
    return record;
  }

  async findOneAndUpdate(
    baseId: string,
    tableId: string,
    query: object,
    data: any,
  ) {
    const collection = this.getCollection(baseId, tableId);
    const result = await collection.findOneAndUpdate(
      query,
      { $set: data },
      { returnDocument: 'after' },
    );
    return result.value;
  }

  async recordFindOneAndUpdate(
    baseId: string,
    tableId: string,
    query: object,
    record: any,
  ) {
    const lookupFields = await this.getTableLookupFields(baseId, tableId);
    await this.roolbackRecordLookupFields(record, lookupFields);
    const updatedRecord = await this.findOneAndUpdate(
      baseId,
      tableId,
      query,
      record,
    );
    await this.convertRecordLookupFields(updatedRecord, lookupFields);
    return updatedRecord;
  }

  async deleteOne(baseId: string, tableId: string, query: object) {
    const collection = this.getCollection(baseId, tableId);
    const result = await collection.deleteOne(query);
    return result;
  }

  async recordDeleteMany(baseId: string, tableId: string, query: object) {
    const records = await this.deleteMany(baseId, tableId, query);
    return records;
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
    const table = await this.metaService.getTableMeta(baseId, tableId);
    if (fieldName === 'created_by' || fieldName === 'modified_by') {
      return {
        type: 'lookup',
        name: fieldName,
        reference_to: 'users',
      };
    }
    return table.fields.find((field) => field.name === fieldName);
  }

  async getTableLookupFields(baseId, tableId) {
    const table = await this.metaService.getTableMeta(baseId, tableId);
    return table.fields.filter((field) => field.type === 'lookup');
  }

  async convertRecordLookupFields(record, lookupFields) {
    for (const field of lookupFields) {
      const loader = await this.getMongodbDataLoader(field.reference_to, [
        '_id',
        'name',
      ]);
      if (record[field.name]) {
        const expandedRecord = (await loader.load(record[field.name])) || {
          _id: field.name,
        };
        record[field.name] = expandedRecord;
      }
    }
    return record;
  }

  async roolbackRecordLookupFields(record, lookupFields) {
    for (const field of lookupFields) {
      if (record[field.name] && record[field.name]._id) {
        record[field.name] = record[field.name]._id;
      }
    }
    return record;
  }
}
