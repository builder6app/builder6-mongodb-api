import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { MongodbModule } from '@/mongodb/mongodb.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '@/auth/auth.module';
import { RoomsGateway } from './rooms.gateway';
import { FilesModule } from '@/files/files.module';

/* 按照 liveblocks.io 规范实现的API */
@Module({
  imports: [
    AuthModule,
    MongodbModule,
    FilesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
