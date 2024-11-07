import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../chat.enum';
import { Message } from '../schemas/message';

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


export class CreateMessageDto extends PickType(Message, ['content','messageType','attachments','mentions','replyTo','reactions','chat']) {}
// export class CreateMessageDto {
//   @ApiProperty()
//   @IsString()
//   @MaxLength(5000)
//   content: string;

//   @ApiProperty({ enum: MessageType })
//   @IsEnum(MessageType)
//   messageType: MessageType;

//   @ApiPropertyOptional({ type: AttachmentDto, isArray: true })
//   @IsOptional()
//   @Type(() => AttachmentDto)
//   attachments?: AttachmentDto[];

//   @ApiPropertyOptional({ type: [String] })
//   @IsOptional()
//   @IsString({ each: true }) // Each element must be a string
//   mentions?: string[];

//   @ApiPropertyOptional()
//   @IsOptional()
//   @IsString()
//   replyTo?: string;
// }



export class UpdateMessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  content: string;
}
