
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsString, IsArray, IsEmail, IsMongoId, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Optional } from '@nestjs/common';

@Schema()
export class Invitation {
  @Prop({ required: true })
  @IsEmail()
  @ApiProperty({ type: String, description: 'Email of the invited person' })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsMongoId()
  @ApiProperty({ type: String, description: 'User ID of the inviter' })
  invitedBy: Types.ObjectId;

  @Prop({ required: true })
  @IsString()
  @ApiProperty({ type: String, description: 'Status of the invitation (e.g., pending, accepted)' })
  status: string;

  @Prop({ type: Date, default: Date.now })
  @IsDate()
  @ApiProperty({ type: Date, description: 'Timestamp when the invitation was sent' })
  invitedAt: Date;
}


@Schema()
export class Member {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Reference to the User ID' })
  user: Types.ObjectId;

  @Prop({ required: true })
  @IsString()
  @ApiProperty({ type: String, description: 'Role of the member in the organization' })
  role: string;
}

@Schema()
export class Organization extends Document {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'Name of the organization' })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsMongoId()
  @ApiProperty({ type: String, description: 'Owner ID of the organization' })
  owner: Types.ObjectId;

  @Prop([{ type: Member }])
  @Optional()
  @ApiProperty({ type: [Member], description: 'List of organization members', required: false })
  members: Member[];

  @Prop({type:Boolean, default: false})
  @ApiProperty({ type: Boolean, description: 'Whether the organization is active or not', default: false })
  isDefault: boolean;

  @Prop([{ type: Invitation }])
  @ApiProperty({ type: [Invitation], description: 'List of organization invitations' })
  invitations: Invitation[];

  @Prop([{ type: Types.ObjectId, ref: 'Project' }])
  @ApiProperty({ type: [String], description: 'References to projects under this organization' })
  projects: Types.ObjectId[];
}
export interface OrganizationDocument extends Organization, Document {}
export const OrganizationSchema = SchemaFactory.createForClass(Organization);