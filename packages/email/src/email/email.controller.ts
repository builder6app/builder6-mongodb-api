import { Controller, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AdminGuard } from '@builder6/core';
import { EmailService } from './email.service';

@UseGuards(AdminGuard)
@Controller('api/v6/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({
    summary: '发送邮件',
    description: '通过提供收件人邮箱、主题和邮件内容发送邮件',
  })
  @ApiBody({
    description: '发送邮件所需的参数',
    schema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          example: 'example@example.com',
          description: '接收邮件的邮箱地址',
        },
        subject: {
          type: 'string',
          example: '邮件标题示例',
          description: '邮件主题',
        },
        text: {
          type: 'string',
          example: '这是一封测试邮件的文本内容',
          description: '邮件的纯文本内容',
        },
        html: {
          type: 'string',
          example: '<h1>这是 HTML 格式的内容</h1>',
          description: '邮件的 HTML 格式内容',
        },
      },
      required: ['to', 'subject'], // 必填字段
    },
  })
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
    @Body('html') html: string,
  ) {
    try {
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


  @Patch('config')
  @ApiOperation({
    summary: '设置邮件参数',
  })
  @ApiBody({
    description: '发送邮件所需的参数',
    schema: {
      type: 'object',
    },
  })
  async updateConfig(
    @Body() config: object,
  ) {
    try {
      await this.emailService.updateConfig(config);
      return { message: 'ok' };
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
