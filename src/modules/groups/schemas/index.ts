import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Document, Types } from 'mongoose';
import { IsObjectId } from 'nestjs-object-id';
import { AbstractDocument } from '../../../database/abstract.schema';

@Schema({ timestamps: true })
export class Group extends AbstractDocument {
  @Prop({ required: true })
  @IsString()
  @ApiProperty({ type: String, description: 'Name of the group' })
  name: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  @ApiProperty({ type: [String], description: 'List of member user IDs' })
  @IsObjectId({ each: true })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: String, description: 'Owner ID of the group' })
  @IsObjectId()
  owner: Types.ObjectId;

  @Prop({ type: String, description: 'Reference to the organization ID' })
  @ApiProperty({ type: String, description: 'Organization ID' })
  @IsString()
  description: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
