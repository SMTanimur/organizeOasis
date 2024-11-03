import { PartialType } from '@nestjs/swagger';
import { Task } from '../schemas';

export class UpdateTaskDto extends PartialType(Task) {}
