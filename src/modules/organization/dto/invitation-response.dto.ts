import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Invitation } from '../schemas';

export enum InvitationResponse {
  ACCEPT = 'accepted',
  REJECT = 'rejected',
}

export class InvitationResponseDto {
  @ApiProperty({
    enum: InvitationResponse,
    description: 'Response to the invitation',
  })
  @IsEnum(InvitationResponse)
  response: InvitationResponse;
}

export class InvitationDto extends PickType(Invitation,['email','invitedAt','status','invitedBy']){}