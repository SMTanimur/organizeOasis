import { PickType } from '@nestjs/swagger';
import { User } from '../schema/user.schema';

export class CreateUserDto extends PickType(User, [
  'firstName',
  'lastName',
  'email',
  'password',
  'provider_id',
  'provider',
  'avatar',
  'role',
  'email_verified',
  'contact',
 
]) {}
