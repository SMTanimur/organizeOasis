/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group-dto';
import { UpdateGroupDto } from './dto/update-group-dto';

@ApiTags('Groups')
@Controller({path: 'groups', version: '1'})
@UseGuards(RolesGuard)
export class GroupController {

  constructor(private readonly groupService: GroupService){}

  @ApiOperation({ summary: 'Create Group' })
  @ApiCreatedResponse({ description: 'Create a Group' })
  @Post()
  async createGroup(@Body() createGroupDto: CreateGroupDto){
    return await this.groupService.createGroup(createGroupDto);
  }

  @ApiOperation({ summary: 'Update Group' })
  @ApiOkResponse({ description: 'Update a Group' })
  @Put(':id')
  async updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto){
    return await this.groupService.updateGroup(id, updateGroupDto);
  }

  @ApiOperation({ summary: 'Delete Group' })
  @ApiOkResponse({ description: 'Delete a Group' })
  @Delete(':id')
  async deleteGroup(@Param('id') id: string){
    return await this.groupService.deleteGroup(id);
  }

  @ApiOperation({ summary: 'Get Group by ID' })
  @ApiOkResponse({ description: 'Get a Group by ID' })
  @Get(':id')
  async getGroupById(@Param('id') id: string){
    return await this.groupService.getGroupById(id);
  }

  @ApiOperation({ summary: 'Get All Groups' })
  @ApiOkResponse({ description: 'Get All Groups' })
  @Get()
  async getAllGroups(){
    return await this.groupService.getAllGroups();
  }

}
