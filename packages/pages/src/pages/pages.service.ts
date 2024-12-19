import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { Liquid } from 'liquidjs';

@Injectable()
export class PagesService {

  private engine: Liquid;

  constructor() {
    this.engine = new Liquid({
      root: path.resolve(__dirname, '../../views'), // 模板目录
      extname: '.liquid',  // 模板文件后缀
    });
  }

  async render(template: string, data: Record<string, any>): Promise<string> {
    return this.engine.renderFile(template, data);
  }
}
