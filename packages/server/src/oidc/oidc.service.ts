import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generators } from 'openid-client';

@Injectable()
export class OidcService {
  constructor(private configService: ConfigService) {
  }
  async getProviderFromDB(providerId: string) {
    const code_challenge_method = 'S256';
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.random();
    const nonce = generators.random(); // 生成 nonce

    // 从数据库获取 OIDC Provider 配置
    return {
      issuer: this.configService.get('identity.oidc.issuer'),
      config_url: this.configService.get('identity.oidc.config.url'),
      client_id: this.configService.get('identity.oidc.client.id'),
      client_secret: this.configService.get('identity.oidc.client.secret'),
      redirect_uri: `${process.env.ROOT_URL}/api/v6/oidc/${providerId}/login/callback`,
      scope: this.configService.get('identity.oidc.scope') || 'openid email profile',
      state,
      nonce,
      code_challenge_method,
      code_verifier,
      code_challenge,
    };
  }
}
