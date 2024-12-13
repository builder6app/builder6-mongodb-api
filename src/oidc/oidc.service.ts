import { Injectable } from '@nestjs/common';
import { generators } from 'openid-client';

const code_challenge_method = 'S256';
const code_verifier = generators.codeVerifier();

@Injectable()
export class OidcService {

  async getProviderFromDB(providerId: string) {

    const code_challenge = generators.codeChallenge(code_verifier);

    // 从数据库获取 OIDC Provider 配置
    return {
      issuer: process.env.STEEDOS_IDENTITY_OIDC_ISSUER,
      configUrl: process.env.STEEDOS_IDENTITY_OIDC_CONFIG_URL,
      client_id: process.env.STEEDOS_IDENTITY_OIDC_CLIENT_ID,
      client_secret: process.env.STEEDOS_IDENTITY_OIDC_CLIENT_SECRET,
      redirect_uri: `${process.env.ROOT_URL}/api/v6/oidc/${providerId}/callback`,
      scope: process.env.STEEDOS_IDENTITY_OIDC_CLIENT_SCOPE || 'openid email profile',
      code_challenge_method,
      code_verifier,
      code_challenge,
    };
  }
}
