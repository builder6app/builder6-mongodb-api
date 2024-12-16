import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MongodbService } from '@/mongodb/mongodb.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private masterSpaceId: string;

  constructor(
    private mongodbService: MongodbService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    password: string,
    spaceId?: string,
  ): Promise<any> {
    if (!spaceId) {
      spaceId = await this.getMasterSpaceId();
    }

    const hash = crypto.createHash('sha256');
    hash.update(password);
    const bcryptPassword = hash.digest('hex');
    const user = (await this.mongodbService.findOne('users', {
      $or: [
        { username: username },
        { 'emails.address': username },
        { mobile: username },
      ],
    })) as any;
    if (!user) {
      throw new UnauthorizedException();
    }

    const match = await bcrypt.compare(
      bcryptPassword,
      user.services.password.bcrypt,
    );
    if (!match) {
      throw new UnauthorizedException();
    }

    const space_user = await this.getSpaceUser(user._id, spaceId);
    if (!space_user) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user._id,
      name: space_user.name,
      email: space_user.email,
      space: spaceId,
      profile: space_user.profile,
    };
    const access_token = this.jwtService.sign(payload);
    const authToken = uuid();

    const stampedAuthToken = this.generateStampedLoginToken(authToken);
    const hashedToken = this.hashStampedToken(stampedAuthToken);

    if (!user['services']) {
      user['services'] = {};
    }
    if (!user['services']['resume']) {
      user['services']['resume'] = { loginTokens: [] };
    }
    user['services']['resume']['loginTokens'].push(hashedToken);
    const data = { services: user['services'] };
    await this.mongodbService.findOneAndUpdate(
      'users',
      { _id: user._id },
      data,
    );

    return {
      access_token: access_token,
      authToken: authToken,
      ...space_user,
    };
  }

  async getMasterSpaceId(): Promise<string> {
    if (this.masterSpaceId) {
      return this.masterSpaceId;
    }
    const space = await this.mongodbService.findOne(
      'spaces',
      {},
      { sort: { created: -1 } },
    );

    if (space) {
      this.masterSpaceId = space._id as any;
    }
    return this.masterSpaceId;
  }

  async getSpaceUser(userId: string, spaceId: string): Promise<any> {
    const spaceUser = await this.mongodbService.findOne('space_users', {
      user: userId,
      space: spaceId,
    });

    if (spaceUser) {
      spaceUser['_id'] = userId;
      delete spaceUser['password'];
    }

    return spaceUser;
  }

  async getUserByToken(token: string): Promise<any> {
    const tokenArray = token.split(',');
    let userId = null;
    let spaceId = null;
    if (tokenArray.length === 1) {
      // It's a normal JWT token
      const payload = this.jwtService.decode(token) as any;
      console.log('payload', payload);
      const user = (await this.mongodbService.findOne('users', {
        _id: payload.sub,
      })) as any;
      if (user) {
        userId = user._id;
        spaceId = payload.space;
      }
    } else if (tokenArray.length === 2 && tokenArray[0] === 'apikey') {
      // It's an API key
      const apiKeyString = tokenArray[1] as string;

      const apiKey = await this.mongodbService.findOne('api_keys', {
        api_key: apiKeyString,
        active: true,
      });
      if (apiKey) {
        userId = apiKey.owner;
        spaceId = apiKey.space;
        await this.mongodbService.findOneAndUpdate(
          'api_keys',
          { _id: apiKey._id },
          { last_use_time: new Date() },
        );
      }
    } else if (tokenArray.length === 2) {
      spaceId = tokenArray[0];
      const authToken = tokenArray[1];
      const hashedStampedToken = this.hashLoginToken(authToken);
      const user = (await this.mongodbService.findOne('users', {
        'services.resume.loginTokens.hashedToken': hashedStampedToken,
      })) as any;
      if (user) userId = user._id;
    }
    if (userId && spaceId) {
      const space_user = await this.getSpaceUser(userId, spaceId);
      return space_user;
    }

    throw new UnauthorizedException();
  }

  extractTokenFromHeaderOrCookie(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    let spaceToken = type === 'Bearer' ? token : undefined;

    if (
      !spaceToken &&
      request.cookies &&
      request.cookies['X-Auth-Token'] &&
      request.cookies['X-Space-Id']
    ) {
      spaceToken = `${request.cookies['X-Space-Id']},${request.cookies['X-Auth-Token']}`;
    }
    return spaceToken;
  }

  hashLoginToken(loginToken) {
    const hash = crypto.createHash('sha256');
    hash.update(loginToken);
    return hash.digest('base64');
  }

  generateStampedLoginToken(token) {
    return {
      token: token,
      when: new Date(),
    };
  }

  hashStampedToken(stampedToken) {
    const hashedStampedToken = Object.keys(stampedToken).reduce(
      (prev, key) =>
        key === 'token' ? prev : { ...prev, [key]: stampedToken[key] },
      {},
    );
    return {
      ...hashedStampedToken,
      hashedToken: this.hashLoginToken(stampedToken.token),
    };
  }
}
