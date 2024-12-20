import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';

@Controller('api/v6/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiQuery({
    name: 'redirect_to',
    required: false,
    description: '登录成功后跳转的地址',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
    examples: {
      test: {
        summary: 'test',
        value: {
          username: 'test',
          password: 'test',
        },
      },
    },
  })
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Query('redirect_to') redirect_to: string,
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    try {
      if (!username || !password) {
        return res.status(401).json({ message: 'username and password is required' });
      }
      const result = await this.authService.signIn(
        username,
        password,
      );
      const { user, space, auth_token, access_token } = result;

      this.authService.setAuthCookies(res, {
        user_id: user,
        space_id: space,
        auth_token,
        access_token,
      });
      if (redirect_to)
        return res.redirect(redirect_to);
      else
        return res.status(200).json(result);
    } catch (error) {
      console.error('Error during signIn:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }
}
