import { PickType } from '@nestjs/swagger';
import { User } from '../schema/user.schema';

export class UpdateEmailDto extends PickType(User, ['email_verified']) {}
