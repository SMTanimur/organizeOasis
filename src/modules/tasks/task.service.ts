/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {

  constructor(
    private readonly taskRepository: TaskRepository,
  ) {}
}
