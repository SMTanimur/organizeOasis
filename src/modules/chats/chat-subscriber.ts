import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ChatEvent } from './chat.enum';
import { SocketGateway } from '../gateway/socket.gateway';




@Injectable()
export class ChatSubscriber {
  constructor(private readonly chatsGateway: SocketGateway) {}

  @OnEvent('chat.message.created')
  handleMessageCreated(payload: any) {
    const { chatId, message } = payload;
    this.chatsGateway.server
      .to(`chat_${chatId}`)
      .emit(ChatEvent.MESSAGE, message);
  }

  @OnEvent('chat.members.added')
  handleMembersAdded(payload: any) {
    const { chatId, userIds, addedBy } = payload;
    this.chatsGateway.server
      .to(`chat_${chatId}`)
      .emit('membersAdded', { chatId, userIds, addedBy });
    
    userIds.forEach(userId => {
      this.chatsGateway.server
        .to(`user_${userId}`)
        .emit('chatInvite', { chatId, invitedBy: addedBy });
    });
  }
}