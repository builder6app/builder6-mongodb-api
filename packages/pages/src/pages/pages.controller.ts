import { Get, Controller, Param, Res, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { getConfigs, getDbConfigs, getMoleculerConfigs } from '@builder6/core';

import { PagesService } from './pages.service';
import { LiquidService } from './liquid.service';



@Controller('/b6/pages')
export class PagesController {
  constructor(private readonly liquidService: LiquidService) {}

  @Get('')
  async Hello() {
    return 'Welcome to Builder6 Pages!';
  }

  @Get(':template')
  async getDemo(
    @Param('template') template: string,
    @Query() query: Record<string, any>,
    @Res() res: Response
  ) {
    const config = getConfigs();
    try {
      const rendered = await this.liquidService.render(template, {
        ...query,
        config,
      }); 

      res.status(200).send(rendered); // 返回渲染后的字符串
    } catch (error) {
      console.log(error)
      return { error: 'Template rendering failed', details: error.message };
    }
  }

}
