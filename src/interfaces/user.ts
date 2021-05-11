import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export class User extends Document {
  passwordResetToken: string;
  passwordResetExpires: number;
  username: string;
  firstName: string;
  @Exclude()
  password: string;
  lastName: string;
  city: string;
  avatar: string;
  email: string;
  confirmed: boolean;
}
