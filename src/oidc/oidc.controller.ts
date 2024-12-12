import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';

@Controller('api/v6/oidc')
export class OidcController {

  @Get('login')
  @UseGuards(AuthGuard('oidc'))
  login() {
    // 触发 OIDC 重定向
  }

  @Get('callback')
  @UseGuards(AuthGuard('oidc'))
  callback(@Req() req: Request, @Res() res: Response) {
    // 登录成功后重定向至受保护页面
    res.redirect('/api/v6/oidc/protected');
  }

  @Get('protected')
  getProtected(@Req() req: Request) {
    if (req['user']) {
      return `Hello, ${req['user']['displayName'] || 'user'}!`;
    }
    return 'You are not authenticated.';
  }
}
