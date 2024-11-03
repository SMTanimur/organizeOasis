import { MessageService } from './message.service';
import { MessageController } from './message.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
