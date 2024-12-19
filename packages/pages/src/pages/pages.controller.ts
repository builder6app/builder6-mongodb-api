import { Get, Controller } from '@nestjs/common';

@Controller('/b6/pages')
export class PagesController {

  @Get('')
  async Hello() {
    return 'Welcome to Builder6 Pages!';
  }
}
