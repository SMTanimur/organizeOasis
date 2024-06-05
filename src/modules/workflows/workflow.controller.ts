/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { RolesGuard } from '../../common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Workflow } from './schemas';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CreateWorkflowDto } from './dto/create-workflow.dto';


@UseGuards(RolesGuard,AuthenticatedGuard)
@ApiTags(Workflow.name)
@Controller({ path: 'workflows', version: '1' })

export class WorkflowController {

  constructor(
    private readonly workflowService: WorkflowService,
  ) {}

  @ApiOperation({ summary: 'Get Workflows' })
  @ApiOkResponse({ description: 'Get nice workflows' })
  @Get()
  async findAll(): Promise<Workflow[]> {
    return this.workflowService.findAll();
  }

  @ApiOperation({ summary: 'Get Workflow' })
  @ApiOkResponse({ description: 'Get nice workflow' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Workflow> {
    return this.workflowService.findOne(id);
  }

  @ApiOperation({ summary: 'create a New Workflow' })
  @ApiOkResponse({ description: 'Create nice workflow' })
  @Post()
  async createWorkflow(input: CreateWorkflowDto): Promise<Workflow> {
    return this.workflowService.createWorkflow(input);
  }

  

  @ApiOperation({ summary: 'Update Workflow' })
  @ApiOkResponse({ description: 'Create nice workflow' })
  @Patch(':id')
  async update(@Param('id') id: string, input: CreateWorkflowDto): Promise<Workflow> {
    return this.workflowService.update(id, input);
  }



}
