import { Module } from '@nestjs/common';
import { OidcService } from './oidc.service';
import { OidcController } from './oidc.controller';
import { PassportModule } from '@nestjs/passport';
import { OidcStrategy } from './oidc.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'oidc', session: true }),
  ],
  providers: [OidcService, OidcStrategy],
  controllers: [OidcController]
})
export class OidcModule {}
