import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [AuthController],
  imports: [UsersModule, MailModule],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
