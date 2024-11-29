import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { AdminGuard } from './admin.guard';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [MongodbModule],
  controllers: [AuthController],
  providers: [AuthService, AdminGuard, AuthGuard],
  exports: [AuthService, AdminGuard, AuthGuard],
})
export class AuthModule {}
