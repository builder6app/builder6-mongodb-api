import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get('')
  async getRoot() {
    return `Welcome to Builder6 API: <a href="/api/v6">/api/v6</a>`;
  }
}
