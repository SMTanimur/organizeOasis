import { PickType } from '@nestjs/swagger';
import { Action } from '../schema';


export class CreateActionDto extends PickType(Action, [
  'type',
  'description',
  'inputs',
  'title',
  'workflowId',
  
  
 
]) {}