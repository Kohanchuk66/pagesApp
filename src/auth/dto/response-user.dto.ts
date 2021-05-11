import { User } from '../../interfaces/user';

export class responseUserDto {
  constructor(user: User) {
    this.username = user.username;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.city = user.city;
    this.email = user.email;
    this.avatar = user.avatar;
  }

  username: string;
  firstName: string;
  lastName: string;
  city: string;
  email: string;
  avatar: string;
}
