import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongodbModule } from '@/mongodb/mongodb.module';

/* 按照 liveblocks.io 规范实现的API */
@Module({
  imports: [MongodbModule],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
