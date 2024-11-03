/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from './task.repository';
import { Task } from './schemas';
import { UpdateTaskDto } from './dto/update-task-dto';
import { CreateTaskDto } from './dto/create-task-dto';

@Injectable()
export class TaskService {

  constructor(
    private readonly taskRepository: TaskRepository,
  ) {}


  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {

    const session = await this.taskRepository.startTransaction()
    try {
      session.startTransaction();
      const task = await this.taskRepository.create(createTaskDto, { session });
      await session.commitTransaction();
      return task;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    }
  
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.find({})
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ _id: id });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
   try {
    const task = await this.getTaskById(id);
    if(!task){
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return await this.taskRepository.findOneAndUpdate({ _id: id }, updateTaskDto);
    
   } catch (error) {
    throw new BadRequestException(error);
   }
  }

  async deleteTask(id: string): Promise<{message:string}> {
    try {
      const task = await this.getTaskById(id);
      if(!task){
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      return await this.taskRepository.findOneAndRemove({ _id: id });
    } catch (error) {
      throw new BadRequestException(error);
      
    }
  
  
  }
}
