import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MongodbService } from '../steedos/mongodb.service';

@Injectable()
export class AuthService {
  constructor(private mongodbService: MongodbService) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.mongodbService.find(
      'users',
      { filters: ['username', '=', username] },
      {},
    );
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    const result = {};
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }
}
