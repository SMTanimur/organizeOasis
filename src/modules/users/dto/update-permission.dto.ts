import { IsEnum } from 'class-validator';
import { Role } from '../../../common/constants/roles.enum';

export class UpdateUserPermissionsDto {
  @IsEnum(Role)
  public permissions: Role;
}
