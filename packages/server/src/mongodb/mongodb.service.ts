import 'regenerator-runtime/runtime';

import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as devextremeQuery from 'devextreme-query-mongodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongodbService {
  private readonly logger = new Logger(MongodbService.name);
  private db: Db;
  private client: MongoClient;

  constructor(private configService: ConfigService) {
    const mongoUrl = configService.get('mongo.url');
    this.client = new MongoClient(mongoUrl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    this.client
      .connect()
      .then(() => {
        this.db = this.client.db();
        this.logger.log('Connected to Steedos MongoDB');
      })
      .catch((err) => {
        this.logger.error('Error connecting to Steedos MongoDB', err);
      });
  }

  async insertOne(collectionName: string, data: any) {
    const collection = this.db.collection(collectionName);
    const entry = { _id: uuidv4(), ...data };
    await collection.insertOne(entry);
    return entry;
  }

  async find(collectionName: string, query: object, options: object = {}) {
    const collection = this.db.collection(collectionName);
    return await collection.find(query, options).toArray();
  }

  async findOne(collectionName: string, query: object, options: object = {}) {
    const collection = this.db.collection(collectionName);
    if (typeof query === 'string') {
      return await collection.findOne({ _id: query as any }, options);
    }
    return await collection.findOne(query, options);
  }

  async objectqlFind(
    collectionName: string,
    queryOptions: any,
    processingOptions: any = { replaceIds: false },
  ) {
    const { top, skip, filters, sort, fields, ...restOptions } = queryOptions;
    const loadOptions = {
      take: top,
      skip,
      requireTotalCount: true,
      ...restOptions,
    } as any;
    if (filters) {
      loadOptions.filter = filters;
    }
    if (sort) {
      const sortFields = sort.split(',');
      loadOptions.sort = sortFields.map((sortField) => {
        const [field, dir] = sortField.split(' ');
        return { selector: field, desc: dir === 'desc' };
      });
    }
    if (fields) {
      if (typeof fields === 'object') {
        loadOptions.select = fields;
      } else if (typeof fields === 'string') {
        loadOptions.select = fields.split(',');
      }
    }
    const collection = this.db.collection(collectionName);

    return devextremeQuery(collection, loadOptions, processingOptions);
  }

  async objectqlFindOne(collectionName: string, options: any) {
    const { filters, fields } = options;
    const result = (await this.objectqlFind(collectionName, {
      filters,
      fields,
    })) as any;
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
  }

  async findOneAndUpdate(collectionName: string, id: string, data: any) {
    const collection = this.db.collection(collectionName);
    const result = await collection.findOneAndUpdate(
      { _id: id as any },
      { $set: data },
      { returnDocument: 'after' },
    );
    return result.value;
  }

  async deleteOne(collectionName: string, query: object) {
    const collection = this.db.collection(collectionName);
    const result = await collection.deleteOne(query);
    return result;
  }

  async deleteMany(collectionName: string, query: object) {
    const collection = this.db.collection(collectionName);
    const result = await collection.deleteOne(query);
    return result;
  }
}
