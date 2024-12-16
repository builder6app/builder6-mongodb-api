import { Injectable } from '@nestjs/common';
import { generators } from 'openid-client';

@Injectable()
export class OidcService {
  async getProviderFromDB(providerId: string) {
    const code_challenge_method = 'S256';
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const state = generators.random();
    const nonce = generators.random(); // 生成 nonce

    // 从数据库获取 OIDC Provider 配置
    return {
      issuer: process.env.B6_OIDC_ISSUER,
      configUrl: process.env.B6_OIDC_CONFIG_URL,
      client_id: process.env.B6_OIDC_CLIENT_ID,
      client_secret: process.env.B6_OIDC_CLIENT_SECRET,
      redirect_uri: `${process.env.ROOT_URL}/api/v6/oidc/${providerId}/callback`,
      scope: process.env.B6_OIDC_CLIENT_SCOPE || 'openid email profile',
      state,
      nonce,
      code_challenge_method,
      code_verifier,
      code_challenge,
    };
  }
}
