import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongodbModule } from '../mongodb/mongodb.module';
import { AdminGuard } from './admin.guard';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    MongodbModule,
    JwtModule.register({
      secret: process.env.B6_JWT_SECRET || 'secret',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminGuard, AuthGuard],
  exports: [AuthService, AdminGuard, AuthGuard],
})
export class AuthModule {}
