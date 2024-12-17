import { Controller, Res, Req, Post, Body, UseGuards } from '@nestjs/common';
import { AdminGuard } from '@builder6/core';
import { EmailService } from './email.service';

@UseGuards(AdminGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body() body: { to: string; subject: string; text?: string; html?: string },
  ) {
    try {
      const { to, subject, text, html } = body;
      await this.emailService.sendMail(to, subject, text, html);
      return { message: '邮件发送成功' };
    } catch (error) {
      console.error('Query error', error);
      return {
        error: {
          code: 500,
          message: error.message,
        },
      };
    }
  }
}
