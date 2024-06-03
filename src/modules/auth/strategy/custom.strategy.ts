import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class CustomStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(req: Request): Promise<any> {
    const body = req.body as any;

    const user = await this.authService.validateUser(body);
    if (!user) {
      throw new UnauthorizedException(
        'The email or password you entered is incorrect.'
      );
    }

    return user;
  }
}
