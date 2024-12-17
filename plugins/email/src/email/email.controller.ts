import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(
    @Body() body: { to: string; subject: string; text?: string; html?: string },
  ) {
    const { to, subject, text, html } = body;
    await this.emailService.sendMail(to, subject, text, html);
    return { message: '邮件发送成功' };
  }
}
