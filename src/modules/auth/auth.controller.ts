/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
// import { AccountActivateDto } from './dto/account-activate.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { AccountActivateDto } from './dto/account-activate.dto';
import { JwtService } from '@nestjs/jwt';
import { pick } from 'lodash';

import { ConfigurationService } from '../../configuration/configuration.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import ms from 'ms';
import { TokenPayload } from 'src/types/jwt-payload.type';
import { Response } from 'express';
import { CustomAuthGuard } from './guards/custom-auth.guard';



@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    public readonly configurationService: ConfigurationService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
 

  ) {}

  @ApiOperation({ summary: 'Register New User' })
  @ApiOkResponse({ description: 'Register user' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto,@Session() session: any) {
    const data = await this.usersService.create(createUserDto);
    await this.usersService.updateByEmail(data.email, {
      email_verified: true,
    });

    

   
    const user = pick(data, ['_id', 'email', 'name', 'role']);
   
    session.passport = { user };
   
    return {
      message: `Welcome to ! Orga 🎉`,
      user: user,
    
   
    };
   
  }

  // @ApiOperation({ summary: 'Activate user account' })
  // @ApiCreatedResponse({ description: 'User account has been activated' })
  // @Post('activate')
  // async activate(@Body() body: AccountActivateDto) {
  //   try {
  //     const payload = this.jwtService.verify(body.token);
  //     const data = await this.usersService.create(payload);
  //     await this.usersService.updateByEmail(data.email, {
  //       email_verified: true,
  //     });

  //     const user = pick(data, ['_id', 'email', 'name', 'role']);
  //     const { access_token, expires_in } = await this.jwt.createToken(
  //       user.email,
  //       user.role
  //     );
  //     return {
  //       message: `Welcome to ! 🎉`,
  //       user: user,
  //       token: access_token,
  //       expires_in,
  //     };
  //   } catch (error) {
  //     throw new NotFoundException(error.message);
  //   }
  // }

  @ApiOperation({ summary: 'Redirects user to client url after login' })
  @UseGuards(CustomAuthGuard)
  @Post('google')
  async loginWithGoogle(@Body('credential') credential: string,@Session() session: any) {
    try {
      const user = await this.authService.authenticateWithGoogle(credential);
      session.passport = { user };
      return { user , message:`Welcome to`};
    } catch (error) {
      throw new BadRequestException(
        'User with this email might already exist.'
      );
    }
  }

  // @Get('facebook/login')
  // @ApiOperation({ summary: 'Performs OAuth2 login via Facebook' })
  // @UseGuards(FacebookAuthGuard)
  // handleFacebookLogin(): void {
  //   return;
  // }

  // @Get('facebook/callback')
  // @HttpCode(301)
  // @ApiOperation({ summary: 'Redirects user to client url after login' })
  // @UseGuards(FacebookAuthGuard)
  // // @Redirect(appConfig.clientUrl, 301)
  // handleFacebookCallback(): void {
  //   return;
  // }

  @ApiOperation({ summary: 'Logs user into the system' })
  @ApiOkResponse({ description: 'Logged in successfully.' })
  @UseGuards(CustomAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() _body: LoginDto,    @Req() req,) {
     await this.authService.validateLogin(_body);
     return { message: 'Welcome back! 🎉', user: req.user };
  }

  @ApiOperation({ summary: 'User Logout Attempt' })
  @ApiOkResponse({
    description: 'User logout successfully.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout() {
    return { message: 'Logout Success' };
  }

  @ApiOperation({ summary: 'User  Password Change' })
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword({
      ...changePasswordDto,
      user: req.user,
    });
  }
}
