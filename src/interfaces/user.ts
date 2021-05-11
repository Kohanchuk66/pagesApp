import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';

export class User extends Document {
  passwordResetToken: string;
  passwordResetExpires: number;
  firstName: string;
  @Exclude()
  password: string;
  lastName: string;
  email: string;
  confirmed: boolean;
}
