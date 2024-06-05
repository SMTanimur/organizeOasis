import { PickType } from "@nestjs/swagger";
import { Workflow } from "../schemas";

export class UpdateStatusDto extends PickType(Workflow, [
  'status',

]) {}