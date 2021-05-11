import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../interfaces/user';
import { LoginDTO, RegisterDTO } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  sanitizeUser(user: User): User {
    return user.depopulate('password');
  }

  async create(userDTO: RegisterDTO): Promise<User> {
    const { username, email } = userDTO;
    const user = await this.userModel.findOne({
      username: new RegExp(username, 'i'),
    });
    const userWithSameEmail = await this.userModel.findOne({ email });
    const regExp = new RegExp('\\w+\\d+');
    if (user)
      throw new HttpException(
        'User with same username already exists',
        HttpStatus.BAD_REQUEST,
      );
    if (userWithSameEmail)
      throw new HttpException(
        'User with same email already exists',
        HttpStatus.BAD_REQUEST,
      );
    const createdUser = new this.userModel(userDTO);
    createdUser.confirmed = false;
    await createdUser.save();
    return this.sanitizeUser(createdUser);
  }

  async findByLogin(userDTO: LoginDTO): Promise<User> {
    const { username, password } = userDTO;
    const user = await this.userModel.findOne({ username });
    if (!user)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    if (!(await bcrypt.compare(password, user.password)))
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);

    return this.sanitizeUser(user);
  }

  async findByPayload(payload): Promise<Record<string, any>> {
    const { username } = payload;
    return this.userModel.findOne({ username });
  }

  async findByEmail(email): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);

    return user;
  }

  async findByResetToken(token, resetExpires): Promise<User> {
    const user = await this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: resetExpires },
    });
    if (!user)
      throw new HttpException(
        'Token is invalid or has expired',
        HttpStatus.BAD_REQUEST,
      );

    return user;
  }

  async changePassword(
    user: User,
    changePasswordDto,
  ): Promise<Record<string, any>> {
    user.password = changePasswordDto.password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    const token = jwt.sign(user._id, this.configService.get('JWT_SECRET'), {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
    return { token };
  }
}
