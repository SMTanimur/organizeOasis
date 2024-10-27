import { PickType } from "@nestjs/swagger";
import { Project } from "../schemas";


export class CreateProjectDto extends PickType(Project, [
  'name',
  'description',
  'organization',
  'members',
  'status',
  'owner',
 
]) {}