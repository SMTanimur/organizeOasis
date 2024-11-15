import { Document, Types } from "mongoose";
import { User } from "../../users/schema/user.schema";
import { ChatMemberRole, ChatType, ChatVisibility, MessageType } from "../chat.enum";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Chat } from "../schemas";


export interface IChatSettings {
  canMembersInvite: boolean;
  canMembersMessage: boolean;
  approvalRequired: boolean;
  messageRetention: number;
}

export interface IChatMember {
  user: User;
  role: ChatMemberRole;
  joinedAt: Date;
  invitedBy?: User;
}

export interface IAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface IReaction {
  user: User;
  emoji: string;
  createdAt: Date;
}

export class IPaginationQuery {
  @ApiPropertyOptional({type:Number})
  page?: number;
  @ApiPropertyOptional({type:Number})
  limit?: number;

  @ApiPropertyOptional({type:String})
  sort?: string;
}

export class IChatQuery extends IPaginationQuery {
  @ApiPropertyOptional({type:ChatType, enum:ChatType})
  type?: ChatType;

  @ApiPropertyOptional({type:String})
  search?: string;

  @ApiPropertyOptional({type:ChatVisibility, enum:ChatVisibility})
  visibility?: ChatVisibility;
}

export class IMessageQuery extends IPaginationQuery {
  @ApiPropertyOptional({type:Date})
  startDate?: Date;

  @ApiPropertyOptional({type:Date})
  endDate?: Date;

  @ApiPropertyOptional({type:MessageType, enum:MessageType})
  messageType?: MessageType;

  @ApiPropertyOptional({type:String})
  search?: string;
}


// Interface for a Group result
export interface GroupResult {
  id: string;
  name: string;
  members: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  }[];
  type: 'Group'; // Added type field
}

// Interface for a Member result
export interface MemberResult {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  type: 'User'; 
}

// User Interface
export interface IUser extends Document {
  _id: Types.ObjectId
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string; // Optional field for user avatar URL
  createdAt: Date; // Date the user was created
  updatedAt: Date; // Date the user was last updated
}

// Combined result type
export type SearchResult = GroupResult | MemberResult;



export interface IMessage {
  _id: string
  chat?: Chat;
  sender: IUser;
  content: string;
  messageType: MessageType;
  attachments?: IAttachment[];
  mentions?: IUser[];
  reactions?: IReaction[];
  replyTo?: string;
  readBy: Map<string, boolean>;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
