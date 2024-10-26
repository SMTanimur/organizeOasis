// project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsString, IsEnum, IsArray, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ProjectStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

@Schema()
export class Project extends Document {
  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  @IsString()
  name: string;

  @Prop()
  @IsString()
  @ApiProperty({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  organization: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({ type: Types.ObjectId, required: true })
  @IsMongoId()
  owner: Types.ObjectId;

  @Prop([{ user: { type: Types.ObjectId, ref: 'User' }, role: String }])
  @ApiProperty({ type: [{ user: Types.ObjectId, role: String }], required: false })
  members: { user: Types.ObjectId; role: string }[];

  @Prop([{ type: Types.ObjectId, ref: 'Task' }])
  @ApiProperty({ type: [Types.ObjectId], required: false })
  tasks: Types.ObjectId[];

  @Prop({ enum: ProjectStatus, default: ProjectStatus.NOT_STARTED })
  @ApiProperty({ enum: ProjectStatus, default: ProjectStatus.NOT_STARTED })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);