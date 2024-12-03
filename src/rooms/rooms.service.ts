import { MongodbService } from '@/mongodb/mongodb.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomsService {
  constructor(private mongodbService: MongodbService) {}
  async createComment() {
    return 'createComment';
  }
}
