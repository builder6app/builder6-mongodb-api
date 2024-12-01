import { Controller, Get, Param, Res } from '@nestjs/common';
import { MetaService } from './meta.service';
import { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/tables/v2/meta/')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Get('bases/:baseId/tables/:tableId')
  @ApiBearerAuth()
  async getTableMeta(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Res() res: Response,
  ) {
    try {
      let table = await this.metaService.getTableMeta(baseId, tableId);
      res.status(200).send(table);
    } catch (error) {
      console.error('Query error', error);
      res.status(500).send(error);
    }
  }
}
