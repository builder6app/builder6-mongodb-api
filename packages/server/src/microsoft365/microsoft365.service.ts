import { Injectable } from '@nestjs/common';
import { default as axios } from 'axios';

@Injectable()
export class Microsoft365Service {
  async getAccessToken() {
    const tenantId = process.env.B6_MICROSOFT365_TENANT_ID;
    const clientId = process.env.B6_MICROSOFT365_CLIENT_ID;
    const clientSecret = process.env.B6_MICROSOFT365_CLIENT_SECRET;

    // 获取访问令牌
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const accessToken = tokenResponse.data.access_token;
    console.log(accessToken);
    return accessToken;
  }
}
