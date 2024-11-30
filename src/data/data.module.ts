import { Module } from '@nestjs/common';
import { MongodbController } from './mongodb.controller';
import { APP_GUARD } from '@nestjs/core';
import { AdminGuard } from '@/auth/admin.guard';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [MongodbController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: AdminGuard,
    // },
  ],
})
export class DataModule {}
