import { Get, Controller, Param, Res, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { getConfigs, getDbConfigs, getMoleculerConfigs } from '@builder6/core';

import { PagesService } from './pages.service';



@Controller('/b6/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('')
  async Hello() {
    return 'Welcome to Builder6 Pages!';
  }

  @Get(':appId/:pageId')
  async getDemo(
    @Param('appId') appId: string,
    @Param('pageId') pageId: string,
    @Query() query: Record<string, any>,
    @Res() res: Response
  ) {
    const template= pageId;
    const config = getConfigs();
    try {
      const rendered = await this.pagesService.render(template, {
        ...query,
        appId,
        pageId,
        config,
      });

      res.status(200).send(rendered); // 返回渲染后的字符串
    } catch (error) {
      console.log(error)
      return { error: 'Template rendering failed', details: error.message };
    }
  }

}
