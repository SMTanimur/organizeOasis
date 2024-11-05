
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsString, IsArray, IsEmail, IsMongoId, IsDate, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Optional } from '@nestjs/common';
import { IsObjectId } from 'nestjs-object-id';

@Schema()
export class Invitation extends Document {
  @Prop({ required: true })
  @IsEmail()
  @ApiProperty({ type: String, description: 'Email of the invited person' })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsObjectId()
  @ApiProperty({ type: String, description: 'User ID of the inviter' })
  invitedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  @IsObjectId()
  @ApiProperty({ type: Types.ObjectId, description: 'Organization ID of the invitation' })
  organization: Types.ObjectId

  @Prop({ required: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, description: 'Status of the invitation (e.g., pending, accepted)' })
  status?: string;

  @Prop({ type: Date, default: Date.now })
  @IsOptional()
  @IsDate()
  @ApiProperty({ type: Date, description: 'Timestamp when the invitation was sent' })
  invitedAt?: Date;
}
export interface InvitationDocument extends Invitation, Document {}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Schema()
export class Member {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsObjectId()
  @IsNotEmpty()
  @ApiProperty({ type: String, description: 'Reference to the User ID' })
  user: Types.ObjectId;

  @Prop({ required: true, enum: MemberRole })
  @IsEnum(MemberRole)
  @ApiProperty({ enum: MemberRole, description: 'Role of the member in the organization' })
  role: MemberRole;
}

export enum OrganizationType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
}

@Schema()
export class Organization extends Document {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'Name of the organization' })
  name: string;

  @Prop({ required: false })
  @IsString()
  @ApiProperty({ type: String, description: 'Description of the organization', required: false })
  description: string;

  
  @Prop({ type: String, enum: OrganizationType, default: OrganizationType.PERSONAL })
  @IsEnum(OrganizationType)
  @ApiProperty({ 
    enum: OrganizationType, 
    description: 'Type of organization',
    default: OrganizationType.PERSONAL
  })
  type: OrganizationType;

  @Prop({ required: false })
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, description: 'Logo text for the organization', required: false })
  logoText?: string;

  @Prop({ required: false })
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, description: 'Brand color for the organization', required: false })
  brandColor?: string;

   
  @Prop({ required: false })
  @IsString()
  @IsOptional() 
  @ApiProperty({ type: String, description: 'Avatar/logo image URL for the organization', required: false })
 logo?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsObjectId()
  @IsOptional()
  @ApiProperty({ type: Types.ObjectId, description: 'Owner ID of the organization' ,required:false})
  owner: Types.ObjectId;

  @Prop([{ type: Member }])
  @Optional()
  @ApiProperty({ type: [Member], description: 'List of organization members', required: false })
  members: Member[];

  @Prop({type:Boolean, default: false})
  @ApiProperty({ type: Boolean, description: 'Whether the organization is active or not', default: false })
  isDefault: boolean;

  
  @Prop([{ type: Types.ObjectId, ref: 'Project' }])
  @ApiProperty({ type: [String], description: 'References to projects under this organization' })
  projects: Types.ObjectId[];
}
export interface OrganizationDocument extends Organization, Document {}
export const OrganizationSchema = SchemaFactory.createForClass(Organization);