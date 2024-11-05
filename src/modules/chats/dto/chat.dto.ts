import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsArray, 
  IsOptional, 
  ValidateNested,
  IsBoolean,
  MinLength,
  MaxLength,
  ArrayMinSize 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMemberRole, ChatType, ChatVisibility } from '../chat.enum';
import { Project } from '../../projects/schemas';
import { Organization } from '../../organization/schemas';
import { Types } from 'mongoose';


export class ChatSettingsDto {
  @ApiProperty()
  @IsBoolean()
  canMembersInvite: boolean;

  @ApiProperty()
  @IsBoolean()
  canMembersMessage: boolean;

  @ApiProperty()
  @IsBoolean()
  approvalRequired: boolean;

  @ApiProperty()
  @IsBoolean()
  messageRetention: number;
}

export class CreateChatDto {
  @ApiProperty({ minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: ChatType })
  @IsEnum(ChatType)
  type: ChatType;

  @ApiProperty({ enum: ChatVisibility })
  @IsEnum(ChatVisibility)
  visibility: ChatVisibility;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  members: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatSettingsDto)
  settings?: ChatSettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Project)
  project?: Types.ObjectId;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Organization)
  organization?: Types.ObjectId;
}

export class UpdateChatDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: ChatVisibility })
  @IsOptional()
  @IsEnum(ChatVisibility)
  visibility?: ChatVisibility;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatSettingsDto)
  settings?: ChatSettingsDto;
}


export class AddMembersDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];

  @ApiPropertyOptional({ enum: ChatMemberRole })
  @IsOptional()
  @IsEnum(ChatMemberRole)
  role?: ChatMemberRole;
}