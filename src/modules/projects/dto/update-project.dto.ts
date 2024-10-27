import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Project } from "../schemas";
import { IsNotEmpty } from "class-validator";
import { IsObjectId } from "nestjs-object-id";

export  class  UpdateProjectDto extends PartialType(Project){
  @IsNotEmpty()
  @IsObjectId()
  @ApiProperty({ type: String, description: 'ID of the user' })
  projectId:string
 
}