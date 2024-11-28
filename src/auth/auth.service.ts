import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MongodbService } from '../steedos/mongodb.service';

@Injectable()
export class AuthService {
  constructor(private mongodbService: MongodbService) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.mongodbService.findOneBy('users', {
      filters: ['username', '=', username],
    });
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    const result = {};
    // TODO: Generate a JWT and return it here
    // instead of the user object
    return result;
  }

  async getUserByToken(token: string): Promise<any> {
    const tokenArray = token.split(',');
    if (tokenArray.length !== 2) {
      throw new UnauthorizedException();
    }
    const spaceId = tokenArray[0];
    const authToken = tokenArray[1];
    const session = await this.mongodbService.findOneBy('sessions', {
      fields: ['userId'],
      filters: [['token', '=', authToken]],
    });
    if (session) {
      const user = await this.mongodbService.findOneBy('space_users', {
        fields: ['_id', 'name', 'email', 'profile', 'space'],
        filters: [
          ['user', '=', session.userId],
          ['space', '=', spaceId],
        ],
      });
      return user;
    }
  }
}
