/* eslint-disable @typescript-eslint/ban-types */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ConfigurationService } from '../../../configuration/configuration.service';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';
import { TokenPayload } from '../../../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
  
    public readonly configurationService: ConfigurationService,
    public readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.Authentication,
      ]),
      secretOrKey: configurationService.JWT_SECRET_KEY,
    });
  }

  // async validate(payload: TokenPayload) {
  //   const user = await this.usersService.findOneByEmail(payload.email);
  //   delete user.password;
  //   return user;
  // }
  async validate(payload: TokenPayload) {
    return  payload;
  }
}
