// task.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {  Types } from 'mongoose';
import { IsNotEmpty, IsString, IsEnum, IsArray, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDocument } from '../../../database/abstract.schema';
import { Optional } from '@nestjs/common';

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

@Schema()
export class Task extends AbstractDocument {
  @Prop({ required: true })
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  @IsString()
  title: string;

  @Prop()
  @IsString()
  @ApiProperty({ type: String, required: false })
  description: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  @ApiProperty({ type: [Types.ObjectId], required: false })
  @IsArray()
  assignedTo: Types.ObjectId[];

  @Prop({ enum: TaskStatus, default: TaskStatus.NOT_STARTED, required: false })
  @ApiProperty({ enum: TaskStatus, default: TaskStatus.NOT_STARTED })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @Prop({ enum: TaskPriority, default: TaskPriority.MEDIUM, required: false })
  @ApiProperty({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  @Optional()
  @ApiPropertyOptional()
  watchers: Types.ObjectId[];

  @Prop({ type: Date })
  @ApiProperty({ type: Date, required: false })
  @IsDate()
  dueDate: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
