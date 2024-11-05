import { User } from "../../users/schema/user.schema";
import { ChatMemberRole, ChatType, ChatVisibility, MessageType } from "../chat.enum";


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

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IChatQuery extends IPaginationQuery {
  type?: ChatType;
  search?: string;
  visibility?: ChatVisibility;
}

export interface IMessageQuery extends IPaginationQuery {
  startDate?: Date;
  endDate?: Date;
  messageType?: MessageType;
  search?: string;
}


// Interface for a Group result
export interface GroupResult {
  id: string;
  name: string;
  members: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  }[];
  type: 'Group'; // Added type field
}

// Interface for a Member result
export interface MemberResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  type: 'User'; 
}

// Combined result type
export type SearchResult = GroupResult | MemberResult;