import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/signIn.dto';
import { AuthUser } from './types/AuthUser.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async signIn(@Body() signInDto: SignInDto) {
    const user = (await this.authService.signIn(signInDto)) as AuthUser;
    return {
      message: 'User has been loggedIn successfully',
      data: user,
    };
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const accessToken = await this.authService.refreshToken(refreshToken);
    return {
      message: 'token has been refreshed successfully',
      data: { accessToken },
    };
  }
}
