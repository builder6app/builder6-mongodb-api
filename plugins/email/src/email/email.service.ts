import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'), // 邮件服务提供商的SMTP服务器地址
      port: this.configService.get('email.port'), // SMTP端口
      // secure: false, // 是否使用TLS
      auth: {
        user: this.configService.get('email.username'), // 邮箱账号
        pass: this.configService.get('email.password'), // 邮箱密码或SMTP授权码
      },
    });
  }

  /**
   * 发送邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param text 文本内容
   * @param html HTML内容
   */
  async sendMail(
    to: string,
    subject: string,
    text?: string,
    html?: string,
  ): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get('email.from'), // 发件人名称和邮箱
      to, // 收件人
      subject, // 主题
      text, // 文本内容
      html, // HTML内容
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log('邮件发送成功:', info.messageId);
    } catch (error) {
      this.logger.error('邮件发送失败:', error);
      throw error;
    }
  }
}
