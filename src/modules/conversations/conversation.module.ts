import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [ConversationController],
  providers: [ConversationService],
})
export class ConversationModule {}
