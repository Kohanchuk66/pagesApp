import { Body, Injectable, ValidationPipe } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signPayload(payload): Promise<any> {
    return sign(payload, 'secretKey', { expiresIn: '12h' });
  }

  async validateUser(payload): Promise<Record<string, any>> {
    return await this.userService.findByPayload(payload);
  }
}
