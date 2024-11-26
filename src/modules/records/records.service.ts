import 'regenerator-runtime/runtime';

import { Injectable } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as devextremeQuery from 'devextreme-query-mongodb';
import { getOptions } from 'devextreme-query-mongodb/options';

@Injectable()
export class RecordsService {
  private db: Db;

  constructor() {
    const client = new MongoClient(process.env.B6_RECORDS_MONGO_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    client
      .connect()
      .then(() => {
        this.db = client.db();
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error('Error connecting to MongoDB', err);
      });
  }

  private getCollection(baseId: string, tableId: string): Collection {
    const collectionName = `t_${baseId}_${tableId}`;
    return this.db.collection(collectionName);
  }

  async createTableEntry(baseId: string, tableId: string, data: any) {
    const collection = this.getCollection(baseId, tableId);
    const entry = { _id: uuidv4(), ...data };
    await collection.insertOne(entry);
    return entry;
  }

  async getTableEntries(baseId: string, tableId: string, query: any) {
    const collection = this.getCollection(baseId, tableId);
    const options = getOptions(query, {
      areaKM2: 'int',
      population: 'int',
    });
    const loadOptions = { take: 20, skip: 0, ...options.loadOptions };
    const processingOptions = {
      replaceIds: false,
      ...options.processingOptions,
    };
    return devextremeQuery(collection, loadOptions, processingOptions);
  }

  async getTableEntryById(baseId: string, tableId: string, id: string) {
    const collection = this.getCollection(baseId, tableId);
    return await collection.findOne({ _id: id as any });
  }

  async updateTableEntry(
    baseId: string,
    tableId: string,
    id: string,
    data: any,
  ) {
    const collection = this.getCollection(baseId, tableId);
    const result = await collection.findOneAndUpdate(
      { _id: id as any },
      { $set: data },
      { returnDocument: 'after' },
    );
    return result.value;
  }

  async deleteTableEntry(baseId: string, tableId: string, id: string) {
    const collection = this.getCollection(baseId, tableId);
    const result = await collection.deleteOne({ _id: id as any });
    return result;
  }
}
