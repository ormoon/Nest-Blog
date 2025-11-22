import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { TokenData } from '../interfaces/TokenData.interface';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    };
    super(opts);
  }
  async validate(payload: TokenData): Promise<any> {
    try {
      const user = await this.userService.findOneById(payload.id);
      if (!user) {
        throw new UnauthorizedException();
      }
      return { ...user, role: payload.role };
    } catch (err) {
      console.log('Error >> ', err);
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
