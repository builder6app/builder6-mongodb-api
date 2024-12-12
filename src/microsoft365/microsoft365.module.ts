import { Module } from '@nestjs/common';
import { Microsoft365Service } from './microsoft365.service';
import { Microsoft365Controller } from './microsoft365.controller';

@Module({
  providers: [Microsoft365Service],
  controllers: [Microsoft365Controller]
})
export class Microsoft365Module {}
