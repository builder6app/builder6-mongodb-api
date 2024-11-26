import { Injectable } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import * as devextremeQuery from 'devextreme-query-mongodb';

@Injectable()
export class MetaService {
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

  async getEntryById(collectionName: string, id: string) {
    const collection: Collection = this.db.collection(collectionName);
    return await collection.findOne({ _id: id as any });
  }

  async createCollectionEntry(collectionName: string, data: any) {
    const collection: Collection = this.db.collection(collectionName);
    const entry = { _id: uuidv4(), ...data };
    await collection.insertOne(entry);
    return entry;
  }

  async updateEntryById(collectionName: string, id: string, data: any) {
    const collection: Collection = this.db.collection(collectionName);
    const result = await collection.findOneAndUpdate(
      { _id: id as any },
      { $set: data },
      { returnDocument: 'after' },
    );
    return result.value;
  }

  async deleteEntryById(collectionName: string, id: string) {
    const collection: Collection = this.db.collection(collectionName);
    const result = await collection.deleteOne({ _id: id as any });
    return result;
  }

  async getEntries(
    collectionName: string,
    loadOptions: any,
    processingOptions: any,
  ) {
    const collection: Collection = this.db.collection(collectionName);

    return devextremeQuery(
      collection,
      { take: 20, skip: 0, ...loadOptions },
      {
        replaceIds: false,
        processingOptions,
      },
    );
  }

  async getTableMeta(baseId: string, tableId: string) {
    const table = await this.getEntryById('b6_tables', tableId);
    const fields = await this.getEntries(
      'b6_fields',
      { filter: ['table_id', '=', tableId] },
      {},
    );
    return {
      table,
      fields,
    };
  }

  async getTableMetaStatic(baseId: string, tableId: string) {
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
