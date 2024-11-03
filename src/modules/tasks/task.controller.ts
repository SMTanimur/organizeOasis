/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Task } from './schemas';
import { RolesGuard } from 'src/common';
import { CreateTaskDto } from './dto/create-task-dto';
import { UpdateTaskDto } from './dto/update-task-dto';

@ApiTags(Task.name)
@UseGuards(RolesGuard)
@Controller({ path: 'tasks', version: '1' })
export class TaskController {
  constructor(private readonly taskService: TaskService){}

 
  @ApiOperation({ summary: 'Create Task' })
  @ApiCreatedResponse({ description: 'Create a Task' })
  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto){
    return await this.taskService.createTask(createTaskDto);
  }

  @ApiOperation({ summary: 'Delete Task' })
  @ApiOkResponse({ description: 'Delete a Task' })
  @Delete(':id')
  async deleteTask(@Param('id') id: string){
    return await this.taskService.deleteTask(id);
  }

  @ApiOperation({ summary: 'Update Task' })
  @ApiOkResponse({ description: 'Update a Task' })
  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto){
    return await this.taskService.updateTask(id, updateTaskDto);
  }


  @ApiOperation({ summary: 'Get Task by ID' })
  @ApiOkResponse({ description: 'Get a Task by ID' })
  @Get(':id')
  async getTaskById(@Param('id') id: string){
    return await this.taskService.getTaskById(id);
  }

  @ApiOperation({ summary: 'Get All Tasks' })
  @ApiOkResponse({ description: 'Get All Tasks' })
  @Get()
  async getAllTasks(){
    return await this.taskService.getAllTasks();
  }

}
