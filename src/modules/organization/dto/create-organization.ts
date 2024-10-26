import { PickType } from "@nestjs/swagger";
import { Organization } from "../schemas";


export class CreateOrganizationDto  extends PickType(Organization,[
  "name",
  "owner",
  "isDefault"
]){}