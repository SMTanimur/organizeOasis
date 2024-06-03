import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '../../common/constants/roles.enum';
import { RolesGuard } from '../../common/guard';
import { Roles } from '../../common/guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { BanUserDto, UpdateUserDto } from './dto/update-user.dto';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';
import { Request } from 'express';


@UseGuards(JwtGuard, RolesGuard)
@ApiTags(User.name)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiOperation({ summary: 'create a New User' })
  @ApiOkResponse({ description: 'Create a user' })
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.ADMIN)
  @Get()
  getAllUsers(@Query() query: GetUsersDto) {
    return this.usersService.getUsers(query);
  }

  @ApiOperation({ summary: 'User get his Profile' })
  @ApiOkResponse({ description: 'success' })
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  // @Roles(Role.USER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  public async me(@Req() request: Request) {
    console.log(request)
    return this.usersService.me(request.user);
  }
  @ApiOperation({ summary: 'User get his Profile' })
  @ApiOkResponse({ description: 'success' })
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.USER, Role.ADMIN)
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiCreatedResponse({ description: 'User successfully updated' })
  @Patch()
  updateUser(@Body() updateUserDto: UpdateUserDto, @Req() request) {
    updateUserDto.userId = request.user._id;
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'User Ban' })
  @ApiCreatedResponse({ description: 'User Ban successfully ' })
  @Post('ban-user')
  @Roles(Role.ADMIN)
  banUser(@Body() banUserDto: BanUserDto) {
    return this.usersService.banUser(banUserDto.id);
  }

  @Post('active-user')
  @Roles(Role.ADMIN)
  activateUser(@Body() activeUserDto: BanUserDto) {
    return this.usersService.activateUser(activeUserDto.id);
  }
}
