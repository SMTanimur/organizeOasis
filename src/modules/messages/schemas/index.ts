import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDocument } from '../../../database/abstract.schema';
import { Type } from 'class-transformer';

enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

@Schema({ timestamps: true })
export class Message extends AbstractDocument {
  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty({ type: String })
  @IsString()
  content: string;

  @Prop({ required: true, enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  @ApiProperty({ enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Type(() => Types.ObjectId)
  @ApiProperty()
  sender: Types.ObjectId;

  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  @Type(() => Types.ObjectId)
  @ApiPropertyOptional()
  @IsOptional() 
  recipient?: Types.ObjectId;
  
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  @Type(() => Types.ObjectId)
  @ApiProperty() 
  conversation: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  @Type(() => Types.ObjectId) 
  @ApiProperty()
  group: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @Type(() => Types.ObjectId)
  @ApiPropertyOptional()
  @IsOptional()
  mentions?: Types.ObjectId[];

  @Prop({ type: String })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @Prop({ type: Boolean, default: false })
  @ApiPropertyOptional()
  @IsOptional()
  isEdited?: boolean;

  @Prop({ type: Boolean, default: false })
  @ApiPropertyOptional()
  @IsOptional()
  isDeleted?: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  @Type(() => Types.ObjectId)
  @ApiPropertyOptional()
  @IsOptional()
  replyTo?: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
