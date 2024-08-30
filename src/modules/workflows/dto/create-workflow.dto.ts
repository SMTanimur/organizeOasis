import { PickType } from '@nestjs/swagger';
import { Workflow } from '../schemas';


export class CreateWorkflowDto extends PickType(Workflow, [
  'name',
  'description',

  'flow',
  'visibility'
 
]) {}