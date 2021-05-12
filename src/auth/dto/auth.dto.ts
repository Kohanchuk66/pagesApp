import { Exclude } from 'class-transformer';

export interface LoginDTO {
  email: string;
  password: string;
}

export class RegisterDTO {
  @Exclude()
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class GoogleUserDTO {
  firstName: string;
  lastName: string;
  email: string;
}
