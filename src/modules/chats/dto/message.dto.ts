import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsArray,
  MaxLength,
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../chat.enum';


export class AttachmentDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  size: number;
}

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiProperty({ enum: MessageType })
  @IsEnum(MessageType)
  messageType: MessageType;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  replyTo?: string;
}

export class UpdateMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  content: string;
}