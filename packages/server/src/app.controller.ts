import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';

@Controller('/')
export class AppController {

  @Get('')
  async getRoot() {
    return `Welcome to the API: <a href="/api/v6">/api/v6</a>`;
  }


}
