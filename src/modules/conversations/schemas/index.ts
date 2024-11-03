import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDocument } from '../../../database/abstract.schema';
import { Type } from 'class-transformer';

@Schema({ timestamps: true })
export class Conversation extends AbstractDocument {
  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Type(() => Types.ObjectId)
  @ApiProperty()
  creator: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  @Type(() => Types.ObjectId)
  @ApiProperty()
  participants: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Message' }] })
  @Type(() => Types.ObjectId)
  @ApiPropertyOptional()
  @IsOptional()
  messages?: Types.ObjectId[];

  @Prop({ type: String })
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @Prop({ type: Boolean, default: false })
  @ApiPropertyOptional()
  @IsOptional()
  isArchived?: boolean;

  @Prop({ type: Date })
  @ApiPropertyOptional()
  @IsOptional()
  lastActivity?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
