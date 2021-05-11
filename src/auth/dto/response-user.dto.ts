import { User } from '../../interfaces/user';

export class responseUserDto {
  constructor(user: User) {
    this.username = user.username;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
  }

  username: string;
  firstName: string;
  lastName: string;
  email: string;
}
