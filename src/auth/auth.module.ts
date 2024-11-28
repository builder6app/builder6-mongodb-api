import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SteedosModule } from '../steedos/steedos.module';

@Module({
  imports: [SteedosModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
