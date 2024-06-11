import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import {  IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import mongoose, { Document, SchemaType, Types } from 'mongoose';


@Schema({timestamps: true})
export class Action {
  @ApiProperty({ type: String, required: true })
  @Prop({ required: true })
  @IsString()
  @MinLength(2)
  type: string;

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
  title?: string;


  @ApiProperty({ type: mongoose.Schema.Types.Mixed, required: false})
  @Prop({ type: mongoose.Schema.Types.Mixed, required: false})
  @IsOptional()
 inputs?:any


 @ApiProperty({type: mongoose.Types.ObjectId, required: true})
 @Prop({type: mongoose.Types.ObjectId, required: true})
 @IsOptional()
 @IsMongoId()
 workflowId: string



}

export interface ActionDocument extends Action, Document {}
export const ActionSchema = SchemaFactory.createForClass(Action);
