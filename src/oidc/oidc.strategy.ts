import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-openidconnect';

@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  constructor() {
    super({
      issuer: process.env.OIDC_ISSUER,
      authorizationURL: process.env.OIDC_AUTH_URL,
      tokenURL: process.env.OIDC_TOKEN_URL,
      userInfoURL: process.env.OIDC_USERINFO_URL,
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      callbackURL: process.env.ROOT_URL + '/api/v6/oidc/callback',
      scope: ['profile', 'email'],
    },
    async (issuer, profile,done) => {
      console.log('OidcStrategy', issuer,profile, done);
      // 此处可根据 profile 信息创建或查找用户
      const user = { ...profile };
      return done(null, user);
    });
  }
}
