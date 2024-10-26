import { TaskService } from './task.service';
import { TaskController } from './task.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [
        TaskService, ],
})
export class TaskModule {}
