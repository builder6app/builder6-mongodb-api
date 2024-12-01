
const SHA256 = require("sha256");
const bcrypt = require('bcrypt');
import crypto = require('crypto');
import { v4 as uuidv4 } from 'uuid';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MongodbService } from '@/mongodb/mongodb.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthService {
  private masterSpaceId : string;

  constructor(private mongodbService: MongodbService, 
    private jwtService: JwtService) {}

  async signIn(username: string, password: string, spaceId?: string): Promise<any> {

    if (!spaceId) {
      spaceId = await this.getMasterSpaceId();
    }

    const bcryptPassword = SHA256(password);
    const user = await this.mongodbService.findOne("users", {
        $or: [{ "username": username }, { "emails.address": username }, { "mobile": username }]
    }) as any;
    if (!user) {
      throw new UnauthorizedException();
    }

    let match = await bcrypt.compare(bcryptPassword, user.services.password.bcrypt);
    if (!match) {
      throw new UnauthorizedException();
    }
    

    const space_user = await this.getSpaceUser(user._id, spaceId);
    if (!space_user) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user._id, name: space_user.name, email: space_user.email, space: spaceId, profile: space_user.profile };
    const authToken = this.jwtService.sign(payload);

    const stampedAuthToken = this.generateStampedLoginToken(authToken);
    const hashedToken = this.hashStampedToken(stampedAuthToken);

    if(!user['services']){
      user['services'] = {}
    }
    if(!user['services']['resume']){
      user['services']['resume'] = {loginTokens: []}
    }
    user['services']['resume']['loginTokens'].push(hashedToken)
    let data = { services: user['services'] }
    const updatedUser = await this.mongodbService.objectqlUpdate('users', user._id, data);

    return {
      authToken: authToken,
      ...space_user
    };
  }

  async getMasterSpaceId(): Promise<string> {
    
    if (this.masterSpaceId) {
      return this.masterSpaceId
    }
    const space = await this.mongodbService.findOne("spaces", {}, { sort: { created: -1 } });

    if (space) {
      this.masterSpaceId = space._id as any;
    }
    return this.masterSpaceId;
  }

  async getSpaceUser(userId: string, spaceId: string): Promise<any> {

    const spaceUser = await this.mongodbService.objectqlFindOne('space_users', {
      filters: [
        ['user', '=', userId],
        ['space', '=', spaceId],
      ],
    });

    if (spaceUser) {
      delete(spaceUser['_id'])
      delete(spaceUser['password'])
      }

    return spaceUser;
  }

  async getUserByToken(token: string): Promise<any> {
    const tokenArray = token.split(',');
    if (tokenArray.length !== 2) {
      throw new UnauthorizedException();
    }
    const spaceId = tokenArray[0];
    const authToken = tokenArray[1];
    const hashedStampedToken = this.hashLoginToken(authToken);
    const user = await this.mongodbService.findOne('users', {
      'services.resume.loginTokens.hashedToken': hashedStampedToken,
    }) as any;
    if (user) {
      const space_user = await this.getSpaceUser(user._id, spaceId);
      return space_user;
    }
  }

  extractTokenFromHeaderOrCookie(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    let spaceToken = type === 'Bearer' ? token : undefined;

    if (!spaceToken && request.cookies && request.cookies['X-Auth-Token'] && request.cookies['X-Space-Id']) {
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
      when: new Date
    };
  }
  
  hashStampedToken(stampedToken) {
    const hashedStampedToken = Object.keys(stampedToken).reduce(
      (prev, key) => key === 'token' ?
        prev :
        { ...prev, [key]: stampedToken[key] },
      {},
    )
    return {
      ...hashedStampedToken,
      hashedToken: this.hashLoginToken(stampedToken.token)
    };
  }
  
}
