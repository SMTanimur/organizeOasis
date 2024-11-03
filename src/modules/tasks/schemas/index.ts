// task.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Types } from 'mongoose';
import { IsNotEmpty, IsString, IsEnum, IsArray, IsDate, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDocument } from '../../../database/abstract.schema';
import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import { Group } from '../../groups/schemas';
import { User } from '../../users/schema/user.schema';

enum TaskStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
@Schema({ timestamps: true })
export class Task extends AbstractDocument {
  @Prop({ required: true })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, description: 'Title of the task' })
  title: string;

  @Prop()
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: String, description: 'Description of the task' })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Type(() => Types.ObjectId)
  @ApiProperty({ description: 'Creator of the task' })
  creator: User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @Type(() => Types.ObjectId)
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ type: [String], description: 'Users assigned to the task' })
  assignees: User[];

  @Prop({ type: Types.ObjectId, ref: 'Group' ,required:false})
  @Type(() => Types.ObjectId)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Group associated with the task' })
  group: Group;

  @Prop({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiProperty({ type: Date, description: 'Due date of the task' })
  dueDate: Date;

  @Prop({ default: 'pending' })
  @IsString()
  @IsEnum(TaskStatus)
  @ApiProperty({ 
    enum: TaskStatus,
    default: TaskStatus.NOT_STARTED,
    description: 'Current status of the task'
  })
  status: string;

  @Prop({ default: TaskPriority.MEDIUM, enum: TaskPriority,required:false })
  @IsEnum(TaskPriority)
  @ApiProperty({ 
    enum: TaskPriority, 
    default: TaskPriority.MEDIUM,
    description: 'Priority level of the task'
  })
  priority: TaskPriority;

  @Prop({ type: [String] ,required:false})
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({ type: [String], description: 'List of attachment URLs' })
  attachments?: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] ,required:false})
  @Type(() => Types.ObjectId)
  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ type: [String], description: 'Users watching the task' })
  watchers?: User[];

  @Prop({ type: [String] ,required:false})
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({ type: [String], description: 'Tags associated with the task' })
  tags?: string[];

  @Prop({type:Date,required:false})
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({ type: Date, description: 'Date when task was completed' })
  completedAt?: Date;

  @Prop({ default: false})
  @IsOptional()
  @ApiPropertyOptional({ type: Boolean, description: 'Whether the task is archived', default: false })
  isArchived: boolean;
}



export const TaskSchema = SchemaFactory.createForClass(Task);
