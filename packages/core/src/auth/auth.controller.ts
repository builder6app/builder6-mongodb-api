import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';

@Controller('api/v6/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
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
    @Body() signInDto: Record<string, any>,
  ) {
    try {
      const result = await this.authService.signIn(
        signInDto.username,
        signInDto.password,
      );
      const { user, space, auth_token, access_token } = result;

      this.authService.setAuthCookies(res, {
        user_id: user,
        space_id: space,
        auth_token,
        access_token,
      });
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error during signIn:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }
}
