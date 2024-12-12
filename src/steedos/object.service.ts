import { MongodbService } from '@/mongodb/mongodb.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectService {
  constructor(private readonly mongodbService: MongodbService) {}

  async getObject(objectName: string) {
    const object = await this.mongodbService.findOne('objects', {
      name: objectName,
    });
    if (object) {
      object.fields = await this.mongodbService.find(
        'object_fields',
        { filter: ['object', '=', objectName] },
        {},
      );
    }
    return object;
  }
}
