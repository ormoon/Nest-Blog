import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignInDto } from './dtos/signIn.dto';
import { isMatchedPassword } from '../common/utils/bcrypt.util';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { TokenData } from './interfaces/TokenData.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private generateAccessToken(user: User): string {
    const payload = { id: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = { id: user.id, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  private verifyToken(token: string, type: string): TokenData {
    const secret =
      type === 'access'
        ? this.configService.get<string>('JWT_ACCESS_SECRET')
        : this.configService.get<string>('JWT_REFRESH_SECRET');

    return this.jwtService.verify(token, { secret });
  }

  private generateTokens(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async signIn(credentials: SignInDto): Promise<any> {
    const { email, password } = credentials;
    const user = await this.userService.findOneByEmail(email);
    const isValid = user && (await isMatchedPassword(password, user.password));
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { user, tokens: this.generateTokens(user) };
  }

  async refreshToken(refreshToken: string) {
    const decodedData = this.verifyToken(refreshToken, 'refresh');
    const user = await this.userService.findOneById(decodedData.id);
    return user && this.generateAccessToken(user);
  }
}
