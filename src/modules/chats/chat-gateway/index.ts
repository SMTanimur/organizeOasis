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
import { WsAuthGuard } from 'src/common/guard/ws-auth-guard';
import { ChatService } from '../chat.service';
import { ChatEvent } from '../chat.enum';



@WebSocketGateway({
  namespace: 'chats',
  cors: {
    origin: process.env.WEB_URL, // Your client URL
    credentials: true, // Important for cookies
  },
})
@UseGuards(WsAuthGuard)
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('ChatGateway');

  constructor(private readonly chatsService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.logger.debug(`WebSocket Server Port: ${3334}`);
  }
  async handleConnection(client: Socket) {
    // Extract the user from the client data (assuming user info is available)
    const user = client.data.user;
    
    // Extract organizationId from the client query or data
    const organizationId = client.handshake.query.organizationId as string;
    if (!organizationId) {
      client.disconnect(true);
      return;
    }
  
    // Join the user's room
    client.join(`user_${user.id}`);
  
    // Fetch user chats using user.id and organizationId
    const chats = await this.chatsService.getUserChats(user.id, organizationId, {});
  
    // Join each chat room
    chats.data.forEach(chat => {
      client.join(`chat_${chat._id}`);
    });
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    client.leave(`user_${user.id}`);
  }

  @SubscribeMessage(ChatEvent.JOIN)
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string,
  ) {
    const user = client.data.user;
    await this.chatsService.validateChatMember(chatId, user.id);
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
    const user = client.data.user;
    client.broadcast.to(`chat_${data.chatId}`).emit(ChatEvent.TYPING, {
      chatId: data.chatId,
      userId: user.id,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage(ChatEvent.READ)
  async handleReadMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; messageIds: string[] },
  ) {
    const user = client.data.user;
    await this.chatsService.markMessagesAsRead(
      data.chatId,
      data.messageIds,
      user.id,
    );
    
    client.broadcast.to(`chat_${data.chatId}`).emit(ChatEvent.READ, {
      chatId: data.chatId,
      userId: user.id,
      messageIds: data.messageIds,
    });
  }
}