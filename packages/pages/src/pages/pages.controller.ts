import { Get, Controller } from '@nestjs/common';

@Controller('/api/v6/pages')
export class PagesController {

  @Get('')
  async Hello() {
    return 'Hello, World!';
  }
}
