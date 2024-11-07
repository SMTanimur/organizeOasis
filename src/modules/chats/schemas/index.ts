import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { User, UserDocument } from "../../users/schema/user.schema";
import { Document, Types } from "mongoose";
import { ChatMemberRole, ChatType, ChatVisibility } from "../chat.enum";

import { Type } from "class-transformer";
import { Organization } from "../../organization/schemas";
import { Project } from "src/modules/projects/schemas";
import { Message } from "./message";
import { IsObjectId } from "nestjs-object-id";



@Schema()
export class ChatSettings {
  @ApiProperty({ 
    description: 'Whether members can invite others',
    default: true 
  })
  @IsBoolean()
  @Prop({ default: true })
  canMembersInvite: boolean;

  @ApiProperty({ 
    description: 'Whether members can send messages',
    default: true 
  })
  @IsBoolean()
  @Prop({ default: true })
  canMembersMessage: boolean;

  @ApiProperty({ 
    description: 'Whether new members need approval',
    default: false 
  })
  @IsBoolean()
  @Prop({ default: false })
  approvalRequired: boolean;
}

@Schema()
export class ChatMember extends Document {
  @ApiProperty({ 
    description: 'User reference',
    type: () => User 
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user:  Types.ObjectId;

  @ApiProperty({ 
    description: 'Member role',
    enum: User,
    example: ChatMemberRole.MEMBER 
  })
  @IsEnum(ChatMemberRole)
  @Prop({ type: String, enum: ChatMemberRole, default: ChatMemberRole.MEMBER })
  role: ChatMemberRole;

  @ApiProperty({
    type:Types.ObjectId
  })
  @IsObjectId()
  @Prop({ type: Types.ObjectId, ref: 'Chat' })
  chat: Types.ObjectId;


  @ApiProperty({ 
    description: 'Join date',
    type: Date 
  })
  @IsOptional()
  @Prop({ type: Date, default: Date.now })
  joinedAt: Date;
}

export const ChatMemberSchema = SchemaFactory.createForClass(ChatMember);


@Schema({ timestamps: true })
export class Chat extends Document {
  @ApiPropertyOptional({ 
    description: 'Chat name',
    example: 'Marketing Team',
    minLength: 2,
    maxLength: 100 
  })
  @IsOptional()
  @IsString()
  @Prop({ 
    required: false,
    minlength: 2,
    maxlength: 100,
    trim: true 
  })
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Chat description',
    example: 'Team discussion for marketing projects' 
  })
  @IsOptional()
  @IsString()
  @Prop({ 
    maxlength: 500,
    trim: true 
  })
  description?: string;

  @ApiProperty({ 
    description: 'Chat type',
    enum: ChatType,
    example: ChatType.GROUP 
  })
  @IsEnum(ChatType)
  @Prop({ 
    type: String,
    enum: ChatType,
    required: true 
  })
  type: ChatType;

  @ApiProperty({ 
    description: 'Chat visibility',
    enum: ChatVisibility,
    default: ChatVisibility.PUBLIC 
  })
  @IsEnum(ChatVisibility)
  @Prop({ 
    type: String,
    enum: ChatVisibility,
    default: ChatVisibility.PUBLIC 
  })
  visibility: ChatVisibility;

  @ApiProperty({ 
    description: 'Chat creator',
    type: () => User 
  })
  @Prop({ 
    type: Types.ObjectId,
    ref: 'User',
    required: true 
  })
  creator: User;

  @ApiProperty({ 
    description: 'Chat members',
    type: [ChatMember] 
  })
  @ValidateNested({ each: true })
  @Type(() => ChatMember)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'ChatMember' }] })
  members: ChatMember[];

  @ApiProperty({ 
    description: 'Chat organization',
    type: () => Organization 
  })
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Organization;


  @ApiPropertyOptional({ 
    description: 'Chat project',
    type: () => Project 
  })
  @IsOptional()
  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project?: Project;

  @ApiProperty({ 
    description: 'Chat settings',
    type: ChatSettings 
  })
  @ValidateNested()
  @Type(() => ChatSettings)
  @Prop({ type: ChatSettings, default: () => ({}) })
  settings: ChatSettings;

  @ApiPropertyOptional({ 
    description: 'Chat avatar URL',
    example: 'https://example.com/avatar.jpg' 
  })
  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;

  @ApiProperty({ 
    description: 'Whether chat is archived',
    default: false 
  })
  @IsBoolean()
  @Prop({ default: false })
  isArchived: boolean;

  @ApiProperty({ description: 'Last message sent in the chat', type: () => Types.ObjectId })
  @IsOptional()
  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  lastMessage?: Message; // Add this field
}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);

// After ChatSchema definition
ChatSchema.index({ name: 'text', description: 'text' });
ChatSchema.index({ 'members.user': 1 });
ChatSchema.index({ creator: 1 });

// Add pre-save hook for validation
ChatSchema.pre('save', function(next) {
  if (this.type === ChatType.DIRECT && this.members.length !== 2) {
    next(new Error('Direct chats must have exactly 2 members'));
  }
  next();
});