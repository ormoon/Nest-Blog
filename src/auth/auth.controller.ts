import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    // const user = await this.authService.signIn(signInDto);
    // return {
    //   message: 'User created successfully',
    //   data: user,
    // };
  }
}
