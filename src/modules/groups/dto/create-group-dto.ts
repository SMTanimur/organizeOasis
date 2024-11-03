import { PickType } from "@nestjs/swagger";
import { Group } from "../schemas";


export class CreateGroupDto extends PickType(Group, ['name','description','members','owner'] ) {}
