import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User, UserDocument } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId, PaginateModel, Types } from 'mongoose';
import { UpdateUserPermissionsDto } from './dto/update-permission.dto';
import { createHash } from '../../utils/hash';
import { LoginDto } from '../auth/dto/login.dto';
import { pick } from 'lodash';
import { JwtService } from '@nestjs/jwt';

import { UpdateEmailDto } from './dto/updateEmail.dto';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
    private readonly jwtService: JwtService,
   
  ) {}

  // async verifyCredentials(createUserDto: CreateUserDto) {
  //   await this.validateCreateUserRequest(createUserDto);
  //   const token = this.jwtService.sign(createUserDto, { expiresIn: '1h' });
  //   return await this.accountService.sendConfirmation(
  //     createUserDto.email,
  //     createUserDto.role,
  //     token
  //   );
  // }

  private async validateCreateUserRequest(createUserDto: CreateUserDto) {
    let user: UserDocument;
    try {
      user = await this.userModel.findOne({
        email: createUserDto.email,
      });
    } catch (err) {
      console.error(err.message);
    }

    if (user) {
      throw new UnprocessableEntityException('User already exists.');
    }
  }

  async me(user: any): Promise<User> {
    return this.userModel
      .findOne({
        email: user.email,
      })
     
  }

  async create(createUserDto: CreateUserDto): Promise<{
    user: UserDocument;
    message: string;
  }> {
    const user = {
      ...createUserDto,
    };
  
    const userRegistered = await this.userModel.findOne({
      email: user.email,
    });
    if (!userRegistered) {
      const userData = new this.userModel(user);
      const password = await createHash(user.password);
      userData.password = password;
      await userData.save();

      return {
        message: 'User created successfully',
        user: userData,
      }
     
      
    } else {
      throw new HttpException('Email is already taken.', HttpStatus.CONFLICT);
    }
  }

  async getUsers({
    search,
    email,
    roles,
    limit,
    page,
    orderBy,
    sortedBy,
  }: GetUsersDto) {
    return await this.userModel.find({
      ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
      ...(email ? { email: { $regex: email, $options: 'i' } } : {})
    });
  }

  async findOne(id: string) {
    return await this.userModel.findOne({ _id: id }).populate(['addresses']);
  }
  async findUser(id: string) {
    return await this.userModel.findOne({ _id: id }).populate(['addresses']);
  }

  async findUserOne(query: object): Promise<UserDocument> {
    const user = await this.userModel.findOne(query);

    if (!user) return null;

    return user;
  }
  async findOneByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async validateUser(loginDto: LoginDto) {
    const { email, password, role = 'user' } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) throw new NotFoundException('There is no user with this email.');

    if (!(await user.comparePassword(password))) {
      throw new UnauthorizedException('The password you entered is incorrect.');
    }
    // if (user.role !== role)
    //   throw new UnauthorizedException('You are not authorized to login.');

    return pick(user.toJSON(), ['_id', 'addresses', 'email', 'name', 'role']);
  }

  async update(updateUserDto: UpdateUserDto) {
    const { userId } = updateUserDto;
    await this.userModel.findByIdAndUpdate(userId, {
      $set: updateUserDto,
    });
    return {
      message: 'successfully updated user',
    };
  }

  async banUser(id: string) {
    return await this.userModel.findByIdAndUpdate(id, {
      $set: { is_active: false },
    });
  }

  async activateUser(id: string) {
    return await this.userModel.findByIdAndUpdate(id, {
      $set: { is_active: true },
    });
  }

  async updateByEmail(email: string, updateUserDto: UpdateEmailDto) {
    return await this.userModel.findOneAndUpdate(
      { email },
      { $set: updateUserDto }
    );
  }

  async removeOrganizationFromUsers(orgId: string): Promise<void> {
    await this.userModel.updateMany(
      { 'organizations.organization': new Types.ObjectId(orgId) },
      { $pull: { organizations: { organization: new Types.ObjectId(orgId) } } }
    );
  }

  async addUserPermission(
    id: string | ObjectId,
    updateUserDto: UpdateUserPermissionsDto
  ) {
    return await this.userModel.findByIdAndUpdate(id, {
      $push: { roles: updateUserDto.permissions },
    });
  }

  async addUserAddress(id: string | ObjectId, addressId: any) {
    return await this.userModel.findByIdAndUpdate(id, {
      $push: { addresses: addressId },
    });
  }
  async removeUserAddress(id: string | ObjectId, addressId: any) {
    return await this.userModel.findByIdAndUpdate(id, {
      $pull: { addresses: addressId },
    });
  }

  async remove(id: string) {
    return await this.userModel.findByIdAndDelete(id, { new: true });
  }
}
