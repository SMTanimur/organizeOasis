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
import { STATUS, User } from '../users/schema/user.schema';
import { ChatEvent } from '../chats/chat.enum';


@WebSocketGateway({
	cors: {
		origin: [
			'http://localhost:3000',
      'https://project-management-five-delta.vercel.app/'
		],
		credentials: true,
	},
	// namespace: 'chat',
	// transports: ['websocket'],
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
   
    
    // Check if user data is available
    const userId = client.handshake.query.userId
 
   
    const organizationId = client.handshake.query.organizationId as string;
  
    if (!organizationId) {
      client.disconnect(true);
      return;
    }

    console.log('userId:', userId);

  
    // Join the user's room
    client.join(`user_${userId}`);
  
    try {
      const chats = await this.chatsService.getUserChats(userId as string, organizationId, { page: 1, limit: 10 });
       // Join each chat room
    chats.data.forEach((chat) => {
      client.join(`chat_${chat._id}`);
    });
      console.log('Chats fetched in socket:', chats);
    } catch (error) {
      console.error('Error fetching chats in socket:', error);
    }
   
  
    // Update user status to online
    await this.chatsService.handleUpdateUserStatus(userId as string, STATUS.ONLINE, new Date());
  
    // Emit the user's online status to all clients
   this.server.emit('userStatusChanged', {
      userId: userId,
      status: STATUS.ONLINE,
    });
  }

  async handleDisconnect(client: Socket) {
    // Check if user data is available
    const userId = client.handshake.query.userId

    // Update user status to offline
    await this.chatsService.handleUpdateUserStatus(
      userId as string,
      STATUS.OFFLINE,
      new Date(),
    );

    // Emit the user's offline status to all clients
    this.server.emit('userStatusChanged', {
      userId: userId,
      status: STATUS.OFFLINE,
    });
  }

  @SubscribeMessage(ChatEvent.JOIN)
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.handshake.query.userId
   
    await this.chatsService.validateChatMember(chatId, userId as string);
    client.join(`chat_${chatId}`);
    return { event: ChatEvent.JOIN, chatId };
  }

  @SubscribeMessage(ChatEvent.LEAVE)
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    client.leave(`chat_${chatId}`);
    return { event: ChatEvent.LEAVE, chatId };
  }

  @SubscribeMessage(ChatEvent.TYPING)
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.handshake.query.userId
    client.broadcast.to(`chat_${data.chatId}`).emit(ChatEvent.TYPING, {
      chatId: data.chatId,
      userId: userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage(ChatEvent.READ)
  async handleReadMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; messageIds: string[] },
  ) {
    const userId = client.handshake.query.userId
    await this.chatsService.markMessagesAsRead(
      data.chatId,
      data.messageIds,
      userId,
    );

    client.broadcast.to(`chat_${data.chatId}`).emit(ChatEvent.READ, {
      chatId: data.chatId,
      userId: userId,
      messageIds: data.messageIds,
    });
  }
}
