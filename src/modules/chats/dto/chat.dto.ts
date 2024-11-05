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
import { Message } from '../schemas/message';
import { IsObjectId } from 'nestjs-object-id';


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

export class ChatMemberDto {
  @ApiProperty({ type: String })
  @IsObjectId()
  user: Types.ObjectId;

  @ApiProperty({ enum: ChatMemberRole })
  @IsEnum(ChatMemberRole)
  role: ChatMemberRole;

  @ApiPropertyOptional({type:Date})
  @IsOptional()
  joinedAt:Date
  
}

export class CreateChatDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 100 })
  @IsString()
  @IsOptional()
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

  @ApiProperty({ type: [ChatMemberDto] })
  @ArrayMinSize(1)
  @Type(() => ChatMemberDto)
  @ValidateNested({each:true})
  members: ChatMemberDto[];

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

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsObjectId()
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

  @ApiProperty({ description: 'Last message sent in the chat', type: () => Types.ObjectId })
  @IsObjectId()
  lastMessage?: Types.ObjectId;
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