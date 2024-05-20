/*
https://docs.nestjs.com/providers#services
*/

import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { Provider, Role } from '../../common/constants/roles.enum';
import * as bcrypt from 'bcryptjs';

import { ConfigurationService } from '../../configuration/configuration.service';

import { JWTService } from './jwt.service';
import { pick } from 'lodash';
import { OAuth2Client } from 'google-auth-library';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configurationService: ConfigurationService,
    private readonly jwtService: JWTService
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validateUser(loginDto: LoginDto): Promise<any> {
    return await this.usersService.validateUser(loginDto);
  }

  async validateLogin(loginDto: LoginDto): Promise<{
    token: string;
    expires_in: string;
    user: object;
    message: string;
  }> {
    const { email, password, role = 'customer' } = loginDto;
    const exitUser = await this.usersService.findOneByEmail(email);
    if (!exitUser) throw new NotFoundException('User not found');
    const user = await this.usersService.findUserOne({ email, role });

    if (!user)
      throw new UnprocessableEntityException(
        `This Email is not registered as a ${role}`
      );

    if (user.provider !== Provider.PASSWORD) {
      throw new UnauthorizedException('You are not authorized to login.');
    }

    if (!(await user.comparePassword(password))) {
      throw new UnauthorizedException('The password you entered is incorrect.');
    }

    const isValidPassword = await user.comparePassword(password);

    if (isValidPassword) {
      const { access_token, expires_in } = await this.jwtService.createToken(
        user.email,
        user.role
      );
      const userInfo = pick(user, [
        '_id',
        'addresses',
        'email',
        'name',
        'role',
      ]);
      return {
        token: access_token,
        expires_in,
        user: userInfo,
        message: 'Welcome back! 🎉',
      };
    } else {
      throw new UnauthorizedException('The password you entered is incorrect.');
    }
  }

  async authenticateWithGoogle(credential: string, role?: string) {
    const clientID = this.configurationService.GOOGLE_CLIENT_ID;
    const clientSecret = this.configurationService.GOOGLE_CLIENT_SECRET;

    const OAuthClient = new OAuth2Client(clientID, clientSecret);
    const client = await OAuthClient.verifyIdToken({ idToken: credential });

    const userPayload = client.getPayload();

    const user = await this.usersService.findOneByEmail(userPayload.email);

    if (!user) {
      const randomString = Math.random().toString(36).substring(2);
      // const username = userPayload.email.split('@')[0];

      const createUserDto: CreateUserDto = {
        firstName: userPayload.given_name,
        lastName: userPayload.family_name,
        email: userPayload.email,
        provider_id: userPayload.sub,
        role: role ? role : Role.USER,
        avatar: userPayload.picture ? userPayload.picture : '',
        password: randomString,
        provider: Provider.GOOGLE,
      };

      return this.usersService.create(createUserDto);
    } else {
      return user;
    }
  }

  async changePassword(changePasswordInput: ChangePasswordDto) {
    const isValidPass = await bcrypt.compare(
      changePasswordInput.oldPassword,
      changePasswordInput.user?.password
    );
    if (isValidPass) {
      const password = await bcrypt.hash(changePasswordInput.newPassword, 10);
      await this.usersService.update({
        userId: changePasswordInput.user._id,
        password,
      });

      return {
        message: 'Password change successful',
      };
    } else {
      throw new HttpException(
        'Unable to change password',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
