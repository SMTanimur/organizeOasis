import { PickType } from "@nestjs/swagger";
import { Task } from "../schemas";

export class CreateTaskDto extends PickType(Task, ['title', 'description','assignees','priority','dueDate','status','creator','group','completedAt','isArchived']) {}