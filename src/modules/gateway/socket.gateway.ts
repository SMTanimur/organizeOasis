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
import { WsAuthGuard } from '../../common/guard/ws-auth-guard';
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
@UseGuards(WsAuthGuard)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('ChatGateway');

  constructor(private readonly chatsService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    const organizationId = client.handshake.query.organizationId as string;

    if (!organizationId) {
      client.disconnect(true);
      return;
    }

    client.join(`user_${userId}`);

    try {
      const chats = await this.chatsService.getSocketChats(
        userId,
        organizationId,
      );
      chats.forEach((chat) => {
        client.join(`chat_${chat._id}`);
      });
    } catch (error) {
      this.logger.error('Error fetching chats in socket:', error);
    }

    await this.chatsService.handleUpdateUserStatus(
      userId as string,
      STATUS.ONLINE,
      new Date(),
    );
    this.server.emit('userStatusChanged', { userId, status: STATUS.ONLINE });
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    await this.chatsService.handleUpdateUserStatus(
      userId as string,
      STATUS.OFFLINE,
      new Date(),
    );
    this.server.emit('userStatusChanged', { userId, status: STATUS.OFFLINE });
  }

  @SubscribeMessage(ChatEvent.JOIN)
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.handshake.query.userId;
    await this.chatsService.validateChatMember(chatId, userId as string);
    client.join(`chat_${chatId}`);
    return { event: ChatEvent.JOIN, chatId };
  }

  @SubscribeMessage(ChatEvent.TYPING)
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.handshake.query.userId;
    this.logger.log('Typing event received:', {
      userId,
      chatId: data.chatId,
      isTyping: data.isTyping,
    });
    client.broadcast
      .to(`chat_${data.chatId}`)
      .emit(ChatEvent.TYPING, {
        chatId: data.chatId,
        userId,
        isTyping: data.isTyping,
      });
  }
}
