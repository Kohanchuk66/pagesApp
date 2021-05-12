import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Req } from '@nestjs/common';
import { User } from '../interfaces/user';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendUserConfirmation(user: User, token: string): Promise<void> {
    const url = `http://localhost:${this.configService.get<string>(
      'PORT',
    )}/auth/confirm/${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: 'Test <test@gmail.com>',
      subject: 'Confirm your Email',
      template: './confirmation',
      context: {
        name: user.firstName,
        url,
      },
    });
  }

  async sendChangePasswordEmail(user: User, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/resetPassword?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: 'Test <test@gmail.com>',
      subject: 'Reset your Password',
      template: './changePassword',
      context: {
        name: user.firstName,
        url,
      },
    });
  }
}
