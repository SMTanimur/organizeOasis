import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Document } from 'mongoose';

export enum Status {
  online = 'online',
  offline = 'offline',
}
export class Node {
  @ApiProperty({ type: String, required: true })
  @Prop({ required: true })
  @IsString()
  id: string;

  @ApiProperty({ type: String, required: true })
  @Prop({ required: true })
  @IsString()
  type: string;
}
@Schema({timestamps: true})
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

  @ApiProperty({ type: Status, required: false })
  @IsEnum(Status)
  @IsOptional()
  @Prop({
    enum: Status,
    default: Status.offline,
  })
  status?: Status;


  


}

export interface WorkflowDocument extends Workflow, Document {}
export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
