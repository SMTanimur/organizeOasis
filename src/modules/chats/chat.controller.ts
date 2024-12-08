/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ChatService } from './chat.service';
import { AddMembersDto, CreateChatDto, UpdateChatDto } from './dto/chat.dto';
import { CurrentUser, UserDto } from '../../common';
import { IChatQuery, IMessageQuery } from './interfaces';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateMessageDto, UpdateMessageDto } from './dto/message.dto';
import { Chat } from './schemas';

@ApiTags(Chat.name)
@UseGuards(AuthenticatedGuard)
@Controller({ path: 'chats', version: '1' })
export class ChatController {
  constructor(private readonly chatsService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @CurrentUser() user: UserDto,
  ) {
    return this.chatsService.createChat(createChatDto, user);
  }

  @Get(':organizationId')
  @ApiOperation({ summary: 'Get user chats' })
  async getUserChats( @Param('organizationId') organizationId: string,  @CurrentUser() user: UserDto, @Query() query: IChatQuery) {
    return this.chatsService.getUserChats(user._id, organizationId, query);
  }
 
  @Get(':chatId/single')
  @ApiOperation({ summary: 'Get chat by ID' })
  async getChatById(@Param('chatId') chatId: string) {
    return this.chatsService.getChatById(chatId);
  }

  @Put(':chatId')
  @ApiOperation({ summary: 'Update chat' })
  async updateChat(
    @Param('chatId') chatId: string,
    @Body() updateChatDto: UpdateChatDto,
    @CurrentUser() user: any,
  ) {
    return this.chatsService.updateChat(chatId, updateChatDto, user);
  }

  @Delete(':chatId')
  @ApiOperation({ summary: 'Delete chat' })
  async deleteChat(@Param('chatId') chatId: string, @CurrentUser() user: any) {
    return this.chatsService.deleteChat(chatId, user);
  }

  @Get(':organizatonId/searchGroupsOrMembers')
  @ApiOperation({ summary: 'Search for groups or members' })
  async searchGroupsOrMembers(
    @Query('q') query: string,
    @CurrentUser() user: any,
    @Param('organizationId') organizationId: string,
  ) {
    return this.chatsService.searchMembersAndGroups(
      query,
      user,
      organizationId,
    );
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query() query: IMessageQuery,
  ) {
    return this.chatsService.getChatMessages(chatId, query);
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Create message' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async createMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: UserDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
   
    return this.chatsService.createMessage(
      chatId,
      createMessageDto,
      user,
      files,
    );
  }

  @Put(':chatId/messages/:messageId')
  @ApiOperation({ summary: 'Update message' })
  async updateMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.chatsService.updateMessage(
      chatId,
      messageId,
      updateMessageDto,
      user,
    );
  }

  @Get(':chatId/validateMember')
  @ApiOperation({ summary: 'Validate chat member' })
  async validateMember( @Param('chatId') chatId: string, @CurrentUser() user: UserDto) {
    return this.chatsService.validateChat(chatId, user._id)
  }

  @Delete(':chatId/messages/:messageId')
  @ApiOperation({ summary: 'Delete message' })
  async deleteMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @CurrentUser() user: any,
  ) {
    return this.chatsService.deleteMessage(chatId, messageId, user);
  }

  @Post(':chatId/members')
  @ApiOperation({ summary: 'Add members to chat' })
  async addMembers(
    @Param('chatId') chatId: string,
    @Body() addMembersDto: AddMembersDto,
    @CurrentUser() user: any,
  ) {
    return this.chatsService.addMembers(chatId, addMembersDto, user);
  }

  @Delete(':chatId/members/:userId')
  @ApiOperation({ summary: 'Remove member from chat' })
  async removeMember(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.chatsService.removeMember(chatId, userId, user);
  }
}
