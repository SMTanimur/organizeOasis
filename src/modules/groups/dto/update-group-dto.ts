import { PartialType } from "@nestjs/swagger";
import { Group } from "../schemas";

export class UpdateGroupDto extends PartialType(Group) {}
