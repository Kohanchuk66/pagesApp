import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../interfaces/user';
import { GoogleUserDTO, LoginDTO, RegisterDTO } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  sanitizeUser(user: User): User {
    return user.depopulate('password');
  }

  async create(userDTO: RegisterDTO, resetToken: string): Promise<User> {
    const { email } = userDTO;
    const userWithSameEmail = await this.userModel.findOne({ email });
    if (userWithSameEmail)
      throw new HttpException(
        'User with same email already exists',
        HttpStatus.BAD_REQUEST,
      );
    const onlyLetters = /^[a-zA-Z]+$/;
    const firstUpperLetter = /^[A-Z]/;
    if (
      !onlyLetters.test(userDTO.firstName) ||
      !onlyLetters.test(userDTO.lastName)
    )
      throw new HttpException(
        'First name and last name must contain only letters',
        HttpStatus.BAD_REQUEST,
      );
    if (
      !firstUpperLetter.test(userDTO.firstName) ||
      !firstUpperLetter.test(userDTO.lastName)
    )
      throw new HttpException(
        'First letter in first name and last name must be in upper case',
        HttpStatus.BAD_REQUEST,
      );
    if (userDTO.password.length <= 7)
      throw new HttpException('Too short password', HttpStatus.BAD_REQUEST);
    const createdUser = new this.userModel(userDTO);
    createdUser.confirmed = false;
    createdUser.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    createdUser.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await createdUser.save();
    return this.sanitizeUser(createdUser);
  }

  async findByLogin(userDTO: LoginDTO): Promise<User> {
    const { email, password } = userDTO;
    const user = await this.userModel.findOne({ email });
    if (!user)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    if (!(await bcrypt.compare(password, user.password)))
      throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);

    return this.sanitizeUser(user);
  }

  async findByPayload(payload): Promise<Record<string, any>> {
    const { firstName } = payload;
    return this.userModel.findOne({ firstName });
  }

  async findByEmail(email): Promise<User> {
    const user = await this.userModel.findOne({ email });

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
    user.confirmed = true;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });
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

  async createGoogleUser(userDTO: GoogleUserDTO) {
    const user = new this.userModel({
      firstName: userDTO.firstName,
      lastName: userDTO.lastName,
      email: userDTO.email,
      fromGoogle: true,
    });
    await user.save();
    return user;
  }
}
