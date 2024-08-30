import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

import {  IsOptional, IsString, MinLength } from 'class-validator';
import { Document } from 'mongoose';

export enum Status {
  online = 'online',
  offline = 'offline',
}

@Schema({ timestamps: true })
export class Workflow {
  @ApiProperty({ type: String, required: true })
  @Prop({ required: true })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ type: String, required: false })
  @Prop()
  @IsString()
  @MinLength(2)
  @IsOptional()
  description: string;

  @ApiProperty({ type: String, required: false })
  @Prop({ required: false })
  @IsString()
  @MinLength(2)
  @IsOptional()
  type: string;



  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @Prop({
   type:String
  })
  visibility?: string

  @ApiProperty({
    description: 'A key-value store for dynamic data',
    type: Object,
    additionalProperties: true,
    required: false,
  })
  @Prop({ type: Map, of: Object, required: false })
  @IsOptional()
  flow: Record<string, any>;
}

export interface WorkflowDocument extends Workflow, Document {}
export const WorkflowSchema = SchemaFactory.createForClass(Workflow);