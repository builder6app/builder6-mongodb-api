import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongodbModule } from '@builder6/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@builder6/core';
import { RoomsGateway } from './rooms.gateway';
import { FilesModule } from '@builder6/core';

/* 按照 liveblocks.io 规范实现的API */
@Module({
  imports: [
    AuthModule,
    MongodbModule,
    FilesModule,
    JwtModule.register({
      secret: process.env.B6_JWT_SECRET || 'secret',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
