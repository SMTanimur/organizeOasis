// socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { ChatService } from '../chats/chat.service';
import { STATUS } from '../users/schema/user.schema';
import { ChatEvent } from '../chats/chat.enum';

@WebSocketGateway({

  cors: {
    origin: [
      'http://localhost:3000',
      'https://project-management-five-delta.vercel.app',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  },
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('SocketGateway');

  constructor(private readonly chatsService: ChatService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    const organizationId = client.handshake.query.organizationId as string;

    if (!organizationId) {
      client.disconnect(true);
      return;
    }

    client.join(`user_${userId}`);

    try {
      const chats = await this.chatsService.getSocketChats(userId, organizationId);
      chats.forEach(chat => client.join(`chat_${chat._id}`));
    } catch (error) {
      this.logger.error('Error fetching chats in socket:', error);
    }

    await this.chatsService.handleUpdateUserStatus(userId as string, STATUS.ONLINE, new Date());
    this.server.emit('userStatusChanged', { userId, status: STATUS.ONLINE });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    await this.chatsService.handleUpdateUserStatus(userId as string, STATUS.OFFLINE, new Date());
    this.server.emit('userStatusChanged', { userId, status: STATUS.OFFLINE });
  }

  @SubscribeMessage(ChatEvent.JOIN)
  async handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    const userId = client.handshake.query.userId;
    await this.chatsService.validateChatMember(chatId, userId as string);
    client.join(`chat_${chatId}`);
    this.logger.log(`User ${userId} joined chat ${chatId}`);
  }

  @SubscribeMessage(ChatEvent.NEW_MESSAGE)
  async handleNewMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string; content: string }) {
    const userId = client.handshake.query.userId;
    this.logger.log(`New message from ${userId} in chat ${data.chatId}: ${data.content}`);
    
    // Emit to the room
    this.server.to(`chat_${data.chatId}`).emit(ChatEvent.NEW_MESSAGE, {
      userId,
      content: data.content,
    });
  
  }

  @SubscribeMessage(ChatEvent.TYPING)
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { chatId: string; isTyping: boolean})  {
    const userId = client.handshake.query.userId;
    this.logger.log(`Typing event from ${userId} in chat ${data.chatId}: ${data.isTyping}`);
    this.server.emit(ChatEvent.TYPING, {
      chatId: data.chatId,
      userId,
      isTyping: data.isTyping,
    });
    client.to(`chat_${data.chatId}`).emit(ChatEvent.TYPING, {
      chatId: data.chatId,
      userId,
      isTyping: data.isTyping,
    });
    // Removed undefined variable return statement
  }
}
