import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Organization } from "../schemas";
import { IsMongoId } from "class-validator";

export class UpdateOrganizationDTO extends  PartialType(Organization) {
  @ApiProperty()
  @IsMongoId()
  organizationID: string;
}