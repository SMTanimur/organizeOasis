import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatMember, ChatMemberSchema, ChatSchema } from './schemas';
import { Message, MessageSchema } from './schemas/message';
import { ChatsGateway } from './chat-gateway';
import { ChatSubscriber } from './chat-subscriber';
import { User, UserSchema } from '../users/schema/user.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: ChatMember.name, schema: ChatMemberSchema },
      {name:User.name, schema:UserSchema},

    ]),
    EventEmitterModule.forRoot({
      // Global configuration for events
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatsGateway, ChatSubscriber],
  exports: [ChatService, ChatsGateway, ChatSubscriber],
})
export class ChatModule {}