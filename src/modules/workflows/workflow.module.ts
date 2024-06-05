import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [
        WorkflowController, ],
  providers: [
        WorkflowService, ],
})
export class WorkflowModule {}
