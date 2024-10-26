// project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IsNotEmpty, IsString, IsEnum, IsArray, IsMongoId } from 'class-validator';

enum ProjectStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

@Schema()
export class Project extends Document {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Prop()
  @IsString()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  @IsMongoId()
  organization: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @IsMongoId()
  owner: Types.ObjectId;

  @Prop([{ user: { type: Types.ObjectId, ref: 'User' }, role: String }])
  members: { user: Types.ObjectId; role: string }[];

  @Prop([{ type: Types.ObjectId, ref: 'Task' }])
  tasks: Types.ObjectId[];

  @Prop({ enum: ProjectStatus, default: ProjectStatus.NOT_STARTED })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);