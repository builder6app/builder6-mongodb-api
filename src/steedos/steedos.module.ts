import { Module } from '@nestjs/common';
import { MongodbController } from './mongodb.controller';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AuthModule, MongodbModule],
  controllers: [MongodbController],
  providers: [
  ],
})
export class SteedosModule {}
