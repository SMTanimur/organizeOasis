import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workflow, WorkflowSchema } from './schemas';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Workflow.name, schema: WorkflowSchema }]),
  ],
  controllers: [
        WorkflowController, ],
  providers: [
        WorkflowService, ],
})
export class WorkflowModule {}
