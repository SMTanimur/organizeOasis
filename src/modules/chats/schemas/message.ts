import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

import { User } from '../../users/schema/user.schema'
import { Chat } from '.';
import { MessageType } from '../chat.enum';
import { AbstractDocument } from '../../../database/abstract.schema';


@Schema()
export class Attachment {
  @ApiProperty({ 
    description: 'File URL',
    example: 'https://example.com/file.pdf' 
  })
  @IsString()
  @Prop({ required: true })
  url: string;

  @ApiProperty({ 
    description: 'File name',
    example: 'document.pdf' 
  })
  @IsString()
  @Prop({ required: true })
  name: string;

  @ApiProperty({ 
    description: 'File MIME type',
    example: 'application/pdf' 
  })
  @IsString()
  @Prop({ required: true })
  type: string;

  @ApiProperty({ 
    description: 'File size in bytes',
    example: 1024 
  })
  @IsNumber()
  @Prop({ required: true })
  size: number;
}

@Schema()
export class Reaction {
  @ApiProperty({ 
    description: 'User who reacted',
    type: () => User 
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @ApiProperty({ 
    description: 'Emoji reaction',
    example: '👍' 
  })
  @IsString()
  @Prop({ required: true })
  emoji: string;

  @ApiProperty({ 
    description: 'Reaction timestamp',
    type: Date 
  })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Message extends Document {
  @ApiProperty({ 
    description: 'Reference to chat',
    type: () => Chat 
  })
  @Prop({ 
    type: MongooseSchema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true 
  })
  chat: Chat;

  @ApiProperty({ 
    description: 'Message sender',
    type: () => User 
  })
  @Prop({ 
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true 
  })
  sender: User;

  @ApiProperty({ 
    description: 'Message content',
    example: 'Hello team!',
    maxLength: 5000 
  })
  @IsString()
  @Prop({ 
    required: true,
    maxlength: 5000,
    trim: true 
  })
  content: string;

  @ApiProperty({ 
    description: 'Message type',
    enum: MessageType,
    example: MessageType.TEXT 
  })
  @IsEnum(MessageType)
  @Prop({ 
    type: String,
    enum: MessageType,
    default: MessageType.TEXT 
  })
  messageType: MessageType;

  @ApiPropertyOptional({ 
    description: 'Message attachments',
    type: [Attachment] 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attachment)
  @Prop({ type: [Attachment] })
  attachments?: Attachment[];

  @ApiPropertyOptional({ 
    description: 'Users mentioned in message',
    type: [User] 
  })
  @IsOptional()
  @IsArray()
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  mentions?: User[];

  @ApiPropertyOptional({ 
    description: 'Message reactions',
    type: [Reaction] 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Reaction)
  @Prop({ type: [Reaction] })
  reactions?: Reaction[];

  @ApiPropertyOptional({ 
    description: 'Reply to message',
    type: () => Message 
  })
  @IsOptional()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Message' })
  replyTo?: Message;

  @ApiProperty({ 
    description: 'Read status by users' 
  })
  @Prop({ type: Map, of: Boolean, default: new Map() })
  readBy: Map<string, boolean>;

  @ApiProperty({ 
    description: 'Whether message is edited',
    default: false 
  })
  @Prop({ default: false })
  isEdited: boolean;

  @ApiPropertyOptional({ 
    description: 'Edit timestamp',
    type: Date 
  })
  @Prop()
  editedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes
MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ content: 'text' });