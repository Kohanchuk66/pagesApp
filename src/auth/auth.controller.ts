import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDTO, RegisterDTO } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as uniqid from 'uniqid';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../interfaces/user';
import { responseUserDto } from './dto/response-user.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  tempAuth() {
    return { auth: 'works' };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  async login(@Body() userDTO: LoginDTO): Promise<Record<string, any>> {
    const user = await this.userService.findByLogin(userDTO);
    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = await this.authService.signPayload(payload);
    const responseUser = new responseUserDto(user);
    return { user: responseUser, token };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() userDTO: RegisterDTO): Promise<Record<string, any>> {
    const containsNumbers = /^.*\d+.*$/;
    const containsLetters = /^.*[a-zA-Z]+.*$/;
    if (!containsNumbers.test(userDTO.password))
      throw new HttpException(
        'Password must contain numbers',
        HttpStatus.BAD_REQUEST,
      );

    if (!containsLetters.test(userDTO.password))
      throw new HttpException(
        'Password must contain letters',
        HttpStatus.BAD_REQUEST,
      );

    const user = await this.userService.create(userDTO);
    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.mailService.sendUserConfirmation(user, resetToken);
    const token = await this.authService.signPayload(payload);
    const responseUser = new responseUserDto(user);
    return { user: responseUser, token };
  }

  @Get('/confirm/:token')
  async confirm(@Param('token') token: string): Promise<User> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    return await this.userService.findByResetToken(hashedToken, Date.now());
  }

  @Post('/forgotPassword')
  async forgotPassword(
    @Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto,
  ): Promise<string> {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    try {
      await this.mailService.sendChangePasswordEmail(user, resetToken);
      return 'Token send to email';
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new HttpException(
        'Error sending the email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/resetPassword/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<Record<string, any>> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userService.findByResetToken(
      hashedToken,
      Date.now(),
    );

    return this.userService.changePassword(user, changePasswordDto);
  }
}
