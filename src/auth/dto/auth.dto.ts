import { Exclude } from 'class-transformer';

export interface LoginDTO {
  email: string;
  password: string;
}

export class RegisterDTO {
  username: string;
  @Exclude()
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}
