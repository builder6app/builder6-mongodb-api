import { Module } from '@nestjs/common';
import { AuthModule } from '@builder6/core';
import { OidcService } from './oidc.service';
import { OidcController } from './oidc.controller';

@Module({
  imports: [AuthModule],
  providers: [OidcService],
  controllers: [OidcController],
})
export class OidcModule {}
