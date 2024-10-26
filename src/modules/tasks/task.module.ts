import { TaskService } from './task.service';
import { TaskController } from './task.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])
  ],
  controllers: [TaskController],
  providers: [
        TaskService, ],
})
export class TaskModule {}
