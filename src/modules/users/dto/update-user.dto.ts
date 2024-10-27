import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { User } from '../schema/user.schema';

export class UpdateUserDto extends PartialType(User) {
  @ApiPropertyOptional({ type: String })
  userId: string;
}
export class BanUserDto {
  @IsMongoId()
  @ApiProperty()
  id: string;
}
