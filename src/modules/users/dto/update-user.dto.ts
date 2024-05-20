import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ type: String })
  userId: string;
}
export class BanUserDto {
  @IsMongoId()
  @ApiProperty()
  id: string;
}
