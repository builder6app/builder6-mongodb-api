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
      issuer: this.configService.get('oidc.issuer'),
      config_url: this.configService.get('oidc.config.url'),
      client_id: this.configService.get('oidc.client.id'),
      client_secret: this.configService.get('oidc.client.secret'),
      redirect_uri: `${this.configService.get('host')}/api/v6/oidc/${providerId}/login/callback`,
      scope: this.configService.get('oidc.scope') || 'openid email profile',
      state,
      nonce,
      code_challenge_method,
      code_verifier,
      code_challenge,
    };
  }
}
