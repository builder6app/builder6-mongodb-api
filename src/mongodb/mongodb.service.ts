import 'regenerator-runtime/runtime';

import { Injectable } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as devextremeQuery from 'devextreme-query-mongodb';

@Injectable()
export class MongodbService {
  private db: Db;

  constructor() {
    const client = new MongoClient(process.env.STEEDOS_MONGO_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    client
      .connect()
      .then(() => {
        this.db = client.db();
        console.log('Connected to Steedos MongoDB');
      })
      .catch((err) => {
        console.error('Error connecting to Steedos MongoDB', err);
      });
  }

  async createRecord(collectionName: string, data: any) {
    const collection = this.db.collection(collectionName);
    const entry = { _id: uuidv4(), ...data };
    await collection.insertOne(entry);
    return entry;
  }

  async find(
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

  async findOne(collectionName: string, id: string) {
    const collection = this.db.collection(collectionName);
    return await collection.findOne({ _id: id as any });
  }

  async findOneBy(collectionName: string, options: any) {
    const { filters, fields } = options;
    const result = (await this.find(collectionName, {
      filters,
      fields,
    })) as any;
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
  }

  async updateRecord(collectionName: string, id: string, data: any) {
    const collection = this.db.collection(collectionName);
    const result = await collection.findOneAndUpdate(
      { _id: id as any },
      { $set: data },
      { returnDocument: 'after' },
    );
    return result;
  }

  async deleteRecord(collectionName: string, id: string) {
    const collection = this.db.collection(collectionName);
    const result = await collection.deleteOne({ _id: id as any });
    return result;
  }
}
