// chat.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

import { ChatSubscriber } from './chat-subscriber';
import { User, UserSchema } from '../users/schema/user.schema';
import { Organization, OrganizationSchema } from '../organization/schemas';
import { UsersModule } from '../users/users.module';
import { SocketModule } from '../gateway/socket.gateway.module';
import { Chat, ChatSchema } from './schemas';
import { Message, MessageSchema } from './schemas/message';

@Module({
  imports: [
    forwardRef(() => SocketModule), // Use forwardRef to handle circular dependency
    UsersModule,
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
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
  providers: [ChatService, ChatSubscriber],
  exports: [ChatService, ChatSubscriber],
})
export class ChatModule {}