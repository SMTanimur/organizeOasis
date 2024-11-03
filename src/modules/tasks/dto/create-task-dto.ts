import { PickType } from "@nestjs/swagger";
import { Task } from "../schemas";

export class CreateTaskDto extends PickType(Task, ['title', 'description','assignedTo','priority','dueDate','status']) {}