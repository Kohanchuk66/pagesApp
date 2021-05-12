import { User } from '../../interfaces/user';

export class responseUserDto {
  constructor(user: User) {
    this.id = user._id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
  }

  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fromGoogle: boolean;
}
