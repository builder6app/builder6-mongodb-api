import { Get, Controller } from '@nestjs/common';

@Controller('api/v6/node-red')
export class NodeRedController {
  constructor() {}

  @Get('')
  getHello(): object {
    return { message: 'Hello World!' };
  }
}
