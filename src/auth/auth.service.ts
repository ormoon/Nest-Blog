import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignInDto } from './dtos/signIn.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signIn(credentials: SignInDto): Promise<any> {
    const { email, password } = credentials;
    const user = await this.userService.findByIdOrEmail(email);
    if (user?.password !== password) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    // TODO: Generate a JWT and return it here
    // instead of the user object
    return user;
  }
}
