import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Req } from '@nestjs/common';
import { User } from '../interfaces/user';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: 'Test <test@gmail.com>',
      subject: 'Confirm your Email',
      template: './confirmation',
      context: {
        name: user.username,
        url,
      },
    });
  }

  async sendChangePasswordEmail(user: User, token: string): Promise<void> {
    const url = `http://localhost:3000/auth/changePassword?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: 'Test <test@gmail.com>',
      subject: 'Change your Password',
      template: './changePassword',
      context: {
        name: user.username,
        url,
      },
    });
  }
}
