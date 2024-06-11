import { PartialType } from '@nestjs/swagger';
import { CreateActionDto } from './create-action.dto';



export class UpdateWorkflowDto extends PartialType(CreateActionDto) {}
