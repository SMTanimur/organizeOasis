import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Chat, ChatDocument, ChatMember } from './schemas';
import { Message } from './schemas/message';
import { AddMembersDto, CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { ChatEvent, ChatMemberRole, ChatType } from './chat.enum';
import {
  GroupResult,
  IChatQuery,
  IMessageQuery,
  IUser,
  MemberResult,
  SearchResult,
} from './interfaces';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { STATUS, User, UserDocument } from '../users/schema/user.schema';
import {
  MemberRole,
  Organization,
  OrganizationDocument,
} from '../organization/schemas';
import { UserDto } from '../../common';
import { update } from 'lodash';
import { SocketGateway } from '../gateway/socket.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    // private readonly usersService: UsersService,
    // private readonly filesService: FilesService,
    @Inject(forwardRef(() => SocketGateway))
    private readonly chatGateway: SocketGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createChat(createChatDto: CreateChatDto, user: UserDto) {
    const { members, type } = createChatDto;

    // Validate members for direct chat
    // if (type === ChatType.DIRECT && members.length !== 1) {
    //   throw new BadRequestException('Direct chat must have exactly one other member');
    // }

    // Check if a direct chat already exists
    if (type === ChatType.DIRECT) {
      const existingChat = await this.findDirectChat(
        user._id.toString(),
        members[0].toString(),
      );
      if (existingChat) {
        return existingChat;
      }
    }

    // Create the new chat with the creator as an admin
    const chat = new this.chatModel({
      ...createChatDto,
      creator: user._id,
      members: [
        {
          user: user._id,
          role: ChatMemberRole.ADMIN,
        },
        ...members.map((memberId) => ({
          user: new Types.ObjectId(memberId.user), // Ensure ObjectId type
          role: ChatMemberRole.MEMBER,
        })),
      ],
    });

    // Save the chat
    await chat.save();

    return {
      message: 'Chat created successfully',
      chat,
    };
  }
  // Method to search for members and groups using a single search parameter
  async searchMembersAndGroups(
    searchTerm: string,
    userId: string,
    organizationId: string,
  ): Promise<SearchResult[]> {
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive regex for search

    // Find all groups the user has created or joined within the organization
    const groups = await this.chatModel
      .find({
        organization: organizationId,
        $or: [
          { creator: userId }, // User is the creator of the group
          { 'members.user': userId }, // User is a member of the group
        ],
        name: { $regex: searchRegex }, // Search by group name
      })
      .populate('members.user', 'firstName lastName email avatar'); // Populate member details

    // Transform groups into GroupResult format with type
    const groupResults: GroupResult[] = groups.map((group) => ({
      id: group._id.toString(),
      name: group.name,
      members: group.members.map((member) => {
        const user = member.user as unknown as IUser; // Type assertion
        return {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
        };
      }),
      type: 'Group', // Specify type as 'Group'
    }));
    // Retrieve the organization and populate its members
    const organization = await this.organizationModel
      .findById(organizationId)
      .populate('members.user', 'firstName lastName email avatar');

    // Filter members by firstName or lastName using the searchRegex
    const filteredMembers = organization.members
      .filter((member: any) => {
        const user = member.user as IUser;
        return (
          searchRegex.test(user.firstName) || searchRegex.test(user.lastName)
        );
      })
      .map((member: any) => ({
        ...member,
        user: member.user as IUser,
      }));

    // Transform filtered members into MemberResult format with type
    const memberResults: MemberResult[] = filteredMembers.map((member) => {
      const user = member.user as unknown as IUser; // Type assertion
      return {
        _id: member.user._id.toString(),
        firstName: member.user.firstName,
        lastName: member.user.lastName,
        email: member.user.email,
        avatar: member.user.avatar,
        type: 'User', // Specify type as 'User'
      };
    });

    // Combine groupResults and memberResults into a single array
    const combinedResults: SearchResult[] = [...groupResults, ...memberResults];

    // Shuffle the combined array to return results randomly
    for (let i = combinedResults.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combinedResults[i], combinedResults[j]] = [
        combinedResults[j],
        combinedResults[i],
      ];
    }

    return combinedResults;
  }

  // remove mamber from chat
  async removeMember(chatId: string, userId: string, user: any) {
    try {
      const member = await this.validateChatMember(chatId, userId);
      if (member.role !== ChatMemberRole.ADMIN) {
        throw new ForbiddenException('Only admins can remove members');
      }

      await this.chatModel.findByIdAndUpdate(chatId, {
        $pull: { members: { user: userId } },
      });

      return {
        message: 'Member removed successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //
  async markMessagesAsRead(chatId: string, messageIds: string[], id: any) {
    try {
      const member = await this.validateChatMember(chatId, id);
      if (member.role !== ChatMemberRole.ADMIN) {
        throw new ForbiddenException('Only admins can mark messages as read');
      }

      await this.messageModel.updateMany(
        { _id: { $in: messageIds }, chat: chatId },
        { $set: { readBy: id } },
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getChatById(chatId: string) {
    const chat = await this.chatModel.findById(chatId).populate({
      path: 'members.user', // Path to populate within `members`
      model: 'User',
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async getUserChats(
    userId: string,
    organizationId: string,
    query: IChatQuery,
  ) {
    const { page = 1, limit = 20, type, search } = query;
    const skip = (page - 1) * limit;

    // Construct the match object to find chats where the user is a member and within the organization
    let match: any = {
      'members.user': userId,
      organization: organizationId, // Include the organizationId in the match
    };

    if (type) {
      match.type = type;
    }

    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Perform aggregation
    const [chats, total] = await Promise.all([
      this.chatModel.aggregate([
        { $match: match }, // Match the chats based on the conditions

        // Lookup for member details
        {
          $lookup: {
            from: 'users', // Assuming the user model is called 'users'
            localField: 'members.user',
            foreignField: '_id',
            as: 'memberDetails',
          },
        },
        {
          $unwind: {
            path: '$memberDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            name: { $first: '$name' },
            type: { $first: '$type' },
            description: { $first: '$description' },
            updatedAt: { $first: '$updatedAt' },
            creator: { $first: '$creator' }, // Get the creator ID
            organization: { $first: '$organization' },
            members: {
              $push: {
                user: {
                  _id: '$memberDetails._id',
                  firstName: '$memberDetails.firstName',
                  lastName: '$memberDetails.lastName',
                  email: '$memberDetails.email',
                  avatar: '$memberDetails.avatar',
                  connection_status: '$memberDetails.connection_status',
                  last_seen: '$memberDetails.last_seen',
                },
              },
            },
          },
        },
        // Lookup for creator details
        {
          $lookup: {
            from: 'users', // Assuming the user model is called 'users'
            localField: 'creator',
            foreignField: '_id',
            as: 'creatorDetails',
          },
        },
        {
          $unwind: {
            path: '$creatorDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup for organization details
        {
          $lookup: {
            from: 'organizations',
            localField: 'organization',
            foreignField: '_id',
            as: 'organizationDetails',
          },
        },
        {
          $unwind: {
            path: '$organizationDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup for lastMessage details
        {
          $lookup: {
            from: 'messages',
            localField: 'lastMessage',
            foreignField: '_id',
            as: 'lastMessageDetails',
          },
        },
        {
          $unwind: {
            path: '$lastMessageDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup for sender details in lastMessage
        {
          $lookup: {
            from: 'users',
            localField: 'lastMessageDetails.sender',
            foreignField: '_id',
            as: 'lastMessageSenderDetails',
          },
        },
        {
          $unwind: {
            path: '$lastMessageSenderDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            creator: {
              _id: '$creatorDetails._id',
              firstName: '$creatorDetails.firstName',
              lastName: '$creatorDetails.lastName',
              email: '$creatorDetails.email',
              avatar: '$creatorDetails.avatar',
            },
            organization: {
              _id: '$organizationDetails._id',
              name: '$organizationDetails.name',
            },
            lastMessage: {
              _id: '$lastMessageDetails._id',
              content: '$lastMessageDetails.content',
              sender: {
                _id: '$lastMessageSenderDetails._id',
                firstName: '$lastMessageSenderDetails.firstName',
                lastName: '$lastMessageSenderDetails.lastName',
                email: '$lastMessageSenderDetails.email',
                avatar: '$lastMessageSenderDetails.avatar',
              },
              createdAt: '$lastMessageDetails.createdAt',
              updatedAt: '$lastMessageDetails.updatedAt',
              messageType: '$lastMessageDetails.messageType',
              attachments: '$lastMessageDetails.attachments',
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            type: 1,
            description: 1,
            updatedAt: 1,
            creator: 1,
            organization: 1,
            members: 1,
            lastMessage: 1,
          },
        },
        {
          $sort: { updatedAt: 1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]),
      this.chatModel.countDocuments(match),
    ]);
    // Return the data
    return {
      data: chats,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSocketChats(userId: any, organizationId: any) {
    // Construct the filter query
    const filter = {
      'members.user': new Types.ObjectId(userId),
      organization: new Types.ObjectId(organizationId),
    };

    // Fetch chat documents with basic fields
    const chats = await this.chatModel
      .find({
        'members.user': new Types.ObjectId(userId),
      })
      .sort({ updatedAt: -1 })
      .select(
        '_id name type description updatedAt creator organization members lastMessage',
      );

    // Fetch additional details for each chat
    const chatDetails = await Promise.all(
      chats.map(async (chat) => {
        // Lookup for creator details
        const creatorDetails = await this.userModel
          .findById(chat.creator)
          .select('_id firstName lastName email avatar');

        // Lookup for organization details
        const organizationDetails = await this.organizationModel
          .findById(chat.organization)
          .select('_id name');

        // Lookup for member details
        const memberDetails = await this.userModel
          .find({ _id: { $in: chat.members.map((m) => m.user) } })
          .select(
            '_id firstName lastName email avatar connection_status last_seen',
          );

        // Lookup for lastMessage details
        const lastMessageDetails = chat.lastMessage
          ? await this.messageModel
              .findById(chat.lastMessage)
              .select(
                '_id content sender createdAt updatedAt messageType attachments',
              )
          : null;

        return {
          _id: chat._id,
          name: chat.name,
          type: chat.type,
          description: chat.description,
          creator: creatorDetails,
          organization: organizationDetails,
          members: memberDetails,
        };
      }),
    );

    // Return the chat details
    return chatDetails;
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

  async handleUpdateUserStatus(userId: string, status: STATUS, lastSeen: Date) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      await this.userModel.findByIdAndUpdate(
        userId,
        { connection_status: status, last_seen: lastSeen },
        { upsert: true },
      );
    } catch (error) {}
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
        .populate('sender', ' avatar firstName lastName email')
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
    user: UserDto,
    files?: Express.Multer.File[],
  ) {
    const member = await this.validateChatMember(chatId, user._id);

    if (!member)
      throw new ForbiddenException('You are not a member of this chat');

    let attachments = [];
    // if (files?.length) {
    //   attachments = await Promise.all(
    //     files.map(file => this.filesService.uploadFile(file))
    //   );
    // }

    const message = new this.messageModel({
      ...createMessageDto,
      chat: chatId,
      sender: user._id,
      attachments,
    });
    await message.save();

    const populatedMessage = await message.populate('sender', 'name avatar');

    // Emit the new message event with the full message object
    this.chatGateway.server
      .to(`chat_${chatId}`)
      .emit(ChatEvent.NEW_MESSAGE, populatedMessage);
      return {

        newMessage:populatedMessage
      }

 
  }

  async updateMessage(
    chatId: string,
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    user: any,
  ) {
    try {
      const message = await this.messageModel.findOne({
        _id: messageId,
        chat: chatId,
      });
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
      const message = await this.messageModel.findOne({
        _id: messageId,
        chat: chatId,
      });
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

  async addMembers(
    chatId: string,
    addMembersDto: AddMembersDto,
    user: UserDto,
  ) {
    const { userIds, role = ChatMemberRole.MEMBER } = addMembersDto;

    // Validate the current user's membership and role in the chat
    const member = await this.validateChatMember(chatId, user._id);

    if (member.role !== ChatMemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can add members');
    }

    // Fetch the chat document
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Find existing members to avoid adding duplicates
    const existingUserIds = chat.members.map((m) => m.user.toString());
    const newUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (newUserIds.length) {
      // Push new members into the chat members array
      newUserIds.forEach((userId) => {
        chat.members.push(
          new this.chatModel.schema.methods.createMember({
            user: new Types.ObjectId(userId),
            role,
            joinedAt: new Date(),
          }),
        );
      });

      // Save the updated chat document
      await chat.save();

      // Emit an event for the added members
      this.eventEmitter.emit('chat.members.added', {
        chatId,
        userIds: newUserIds,
        addedBy: user._id,
      });
    }

    return {
      message: 'Members added successfully',
    };
  }

  public async validateChatMember(chatId: string, userId: string) {
    const chat = await this.chatModel.findById(chatId).populate({
      path: 'members.user', // Path to populate within `members`
      model: 'User',
    });
    console.log({ chat });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check if the user is a member of the chat
    const member = chat.members.find(
      (m) => m.user._id.toString() === userId.toString(),
    );
    if (!member) {
      throw new ForbiddenException('Not a member of this chat');
    }

    return member;
  }

  public async validateChat(chatId: string, userId: string) {
    const chat = await this.chatModel.findById(chatId).populate({
      path: 'members.user', // Path to populate within `members`
      model: 'User',
    });
    console.log({ chat });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
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
