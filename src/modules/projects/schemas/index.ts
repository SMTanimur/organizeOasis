// project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsString, IsEnum, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObjectId } from 'nestjs-object-id';
import { User } from '../../users/schema/user.schema';


enum ProjectStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

export enum MemberRole {
  OWNER = 'Owner',
  ADMIN = 'Admin',
  MEMBER = 'Member',
}
@Schema({ _id: false }) // _id is set to false to avoid creating separate IDs for each member
export class Member {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: String, description: 'ID of the user' })
  @IsObjectId()
  user: User

  @Prop({ enum: MemberRole, required: true }) // Use enum for role
  @ApiProperty({ enum: MemberRole, description: 'Role of the member' })
  @IsEnum(MemberRole)
  role: MemberRole;
}

@Schema()
export class Project extends Document {
  @Prop({type:String, required: true })
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  @IsString()
  name: string;

  @Prop({type:String, required: false})
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  organization: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  owner: Types.ObjectId;

  @Prop({ type: [Member] }) // Reference to Member schema for embedding
  @ApiPropertyOptional({
    type: [Member],
    required: false,
    description: 'Array of members with user and role',
  })
  @IsArray()
  members: Member[];

  @Prop({ enum: ProjectStatus, default: ProjectStatus.NOT_STARTED })
  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.NOT_STARTED })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export type ProjectDocument = Project & Document;
export const ProjectSchema = SchemaFactory.createForClass(Project);