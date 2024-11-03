import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Chat, ChatMember } from './schemas';
import { Message } from './schemas/message';
import { AddMembersDto, CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { ChatMemberRole, ChatType } from './chat.enum';
import { IChatQuery, IMessageQuery } from './interfaces';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatMember.name) private chatMemberModel: Model<ChatMember>,
    // private readonly usersService: UsersService,
    // private readonly filesService: FilesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createChat(createChatDto: CreateChatDto, user: any) {
    const { members, type } = createChatDto;

    // Validate members
    if (type === ChatType.DIRECT && members.length !== 1) {
      throw new BadRequestException(
        'Direct chat must have exactly one other member',
      );
    }

    // Check if direct chat already exists
    if (type === ChatType.DIRECT) {
      const existingChat = await this.findDirectChat(user.id, members[0]);
      if (existingChat) {
        return existingChat;
      }
    }

    // Create chat
    const chat = new this.chatModel({
      ...createChatDto,
      creator: user.id,
    });
    await chat.save();

    // Add members
    const memberDocs = [
      {
        chat: chat._id,
        user: user.id,
        role: ChatMemberRole.ADMIN,
      },
      ...members.map((memberId) => ({
        chat: chat._id,
        user: memberId,
        role: ChatMemberRole.MEMBER,
      })),
    ];
    await this.chatMemberModel.insertMany(memberDocs);

    return {
      message: 'Chat created successfully',
    };
  }

  // remove mamber from chat
  async removeMember(chatId: string, userId: string, user: any) {
   
    try {
      const member = await this.validateChatMember(chatId, userId);
      if (member.role !== ChatMemberRole.ADMIN) {
        throw new ForbiddenException('Only admins can remove members');
      }

      await this.chatMemberModel.deleteOne({ _id: member._id });

      return {
        message: 'Member removed successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //
async  markMessagesAsRead(chatId: string, messageIds: string[], id: any) {
    try {
      const member = await this.validateChatMember(chatId, id);
      if (member.role !== ChatMemberRole.ADMIN) {
        throw new ForbiddenException('Only admins can mark messages as read');
      }
      
      await this.messageModel.updateMany({ _id: { $in: messageIds }, chat: chatId }, { $set: { readBy: id } });

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // get chat by id
  async getChatById(chatId: string) {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

   
  // get user chats
  async getUserChats(userId: string, query: IChatQuery) {
    const { page = 1, limit = 20, type, search, visibility } = query;
    const skip = (page - 1) * limit;

    const memberChats = await this.chatMemberModel
      .find({ user: userId })
      .select('chat')
      .lean()
      .exec();

    const chatIds = memberChats.map((m) => m._id);

    let filter: any = { _id: { $in: chatIds } };
    if (type) filter.type = type;
    if (visibility) filter.visibility = visibility;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [chats, total] = await Promise.all([
      this.chatModel
        .find(filter)
        .populate('creator', 'name avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.chatModel.countDocuments(filter),
    ]);

    return {
      data: chats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  //update chat
  async updateChat(chatId: string, updateChatDto: UpdateChatDto, user: any) {
    try {
      const member = await this.validateChatMember(chatId, user.id);
      // if (member.role !== ChatMemberRole.ADMIN) {
      //   throw new ForbiddenException('Only admins can update chat');
      // }

      await this.chatModel.updateOne({ _id: chatId }, { $set: updateChatDto });

      return {
        message: 'Chat updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //delete chat
  async deleteChat(chatId: string, user: any) {
    try {
      const member = await this.validateChatMember(chatId, user.id);
      // if (member.role !== ChatMemberRole.ADMIN) {
      //   throw new ForbiddenException('Only admins can delete chat');
      // }

      await this.chatModel.deleteOne({ _id: chatId });

      return {
        message: 'Chat deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getChatMessages(chatId: string, query: IMessageQuery) {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      messageType,
      search,
    } = query;
    const skip = (page - 1) * limit;

    let filter: any = { chat: chatId };
    if (startDate) filter.createdAt = { $gte: startDate };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: endDate };
    if (messageType) filter.messageType = messageType;
    if (search) filter.content = { $regex: search, $options: 'i' };

    const [messages, total] = await Promise.all([
      this.messageModel
        .find(filter)
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.messageModel.countDocuments(filter),
    ]);

    return {
      data: messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createMessage(
    chatId: string,
    createMessageDto: CreateMessageDto,
    user: any,
    files?: Express.Multer.File[],
  ) {
    const member = await this.validateChatMember(chatId, user.id);

    let attachments = [];
    // if (files?.length) {
    //   attachments = await Promise.all(
    //     files.map(file => this.filesService.uploadFile(file))
    //   );
    // }

    const message = new this.messageModel({
      ...createMessageDto,
      chat: chatId,
      sender: user.id,
      attachments,
    });
    await message.save();

    const populatedMessage = await message.populate('sender', 'name avatar');

    this.eventEmitter.emit('chat.message.created', {
      chatId,
      message: populatedMessage,
    });

    return populatedMessage;
  }

  async updateMessage(
    chatId: string,
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    user: any,
  ) {
    try {
      const message = await this.messageModel.findById(messageId);
      if (!message) {
        throw new NotFoundException('Message not found');
      }
      if (message.sender.toString() !== user.id) {
        throw new ForbiddenException('Only the sender can update the message');
      }

      await this.messageModel.updateOne(
        { _id: messageId },
        { $set: updateMessageDto },
      );

      return {
        message: 'Message updated successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteMessage(chatId: string, messageId: string, user: any) {
    try {
      const message = await this.messageModel.findById(messageId);
      if (!message) {
        throw new NotFoundException('Message not found');

      }
      await this.messageModel.deleteOne({ _id: messageId });

      return {
        message: 'Message deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

 async 

  async addMembers(chatId: string, addMembersDto: AddMembersDto, user: any) {
    const { userIds, role = ChatMemberRole.MEMBER } = addMembersDto;
    const member = await this.validateChatMember(chatId, user.id);

    if (member.role !== ChatMemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can add members');
    }

    const existingMembers = await this.chatMemberModel
      .find({ chat: chatId, user: { $in: userIds } })
      .select('user');
    const existingUserIds = existingMembers.map((m) => m.user.toString());
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length) {
      const memberDocs = newUserIds.map((userId) => ({
        chat: chatId,
        user: userId,
        role,
        invitedBy: user.id,
      }));
      await this.chatMemberModel.insertMany(memberDocs);

      this.eventEmitter.emit('chat.members.added', {
        chatId,
        userIds: newUserIds,
        addedBy: user.id,
      });
    }

    return {
      message: 'Members added successfully',
    };
  }

 public async validateChatMember(chatId: string, userId: string) {
    const member = await this.chatMemberModel.findOne({
      chat: chatId,
      user: userId,
    });
    if (!member) {
      throw new ForbiddenException('Not a member of this chat');
    }
    return member;
  }

  private async findDirectChat(userId1: string, userId2: string) {
    const chats = await this.chatModel
      .find({
        type: ChatType.DIRECT,
        members: { $all: [userId1, userId2], $size: 2 },
      })
      .limit(1);
    return chats[0];
  }
}
