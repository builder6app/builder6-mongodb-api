import { Module } from '@nestjs/common';
import { AuthModule, MongodbModule } from '@builder6/core';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [AuthModule, MongodbModule],
  providers: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
