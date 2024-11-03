import { IsEnum, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { IsObjectId } from "nestjs-object-id";
export enum OrganizationType {
  OWN = 'own',
  JOINED = 'joined',
}

export class GetOrganizationDto {
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @IsObjectId()
  @IsOptional()
  userId?: Types.ObjectId;
}
