import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles, RolesGuard } from '../../common/guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Organization } from './schemas';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization';
import {  Role, UserDto } from '../../common';
import { CurrentUser } from '../../common/decorator';
import { Types } from 'mongoose';
import { UpdateOrganizationDTO } from './dto/update-organization';
import {
  InvitationDto,
  InvitationResponseDto,
} from './dto/invitation-response.dto';
import { GetOrganizationDto } from './dto/get-organization';

@ApiTags(Organization.name)
@UseGuards(AuthenticatedGuard)
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @ApiOperation({ summary: 'Create Organization' })
  @ApiCreatedResponse({ description: 'Create a Organization' })
  @Post()
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: UserDto,
  ) {
    console.log({ user });
    // console.log({user})
    createOrganizationDto.owner = new Types.ObjectId(user._id);
    return await this.organizationService.create(createOrganizationDto);
  }

  @ApiOperation({ summary: 'Get Organization' })
  @UseGuards(AuthenticatedGuard)
  @Roles(Role.ADMIN, Role.USER)
  @ApiCreatedResponse({ description: 'Get a Organization' })
  @Get()
  async get(
    @Query() getOrganizationDto: GetOrganizationDto,
    @CurrentUser() user: UserDto,
  ) {
    getOrganizationDto.userId = new Types.ObjectId(user._id);
    return await this.organizationService.getAll(getOrganizationDto);
  }

  @ApiOperation({ summary: 'Get Organization' })
  @UseGuards(AuthenticatedGuard)
  @ApiCreatedResponse({ description: 'Get a Organization' })
  @Get(':id')
  async getOrganization(@Param('id') organizationId: string) {
    return await this.organizationService.getOrganization(organizationId);
  }

  @ApiOperation({ summary: 'Update Organization' })
  @UseGuards(RolesGuard)
  @ApiCreatedResponse({ description: 'Update a Organization' })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDTO,
    @CurrentUser() user: UserDto,
  ) {
    return await this.organizationService.update(
      id,
      updateOrganizationDto,
      new Types.ObjectId(user._id),
    );
  }

  @ApiOperation({ summary: 'Delete Organization' })
  @UseGuards(RolesGuard)
  @ApiCreatedResponse({ description: 'Delete a Organization' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.organizationService.delete(id);
  }

  @Put(':id/invitations')
  @ApiOperation({ summary: 'Send an invitation to a user' })
  @ApiResponse({ status: 200, description: 'Invitation sent successfully' })
  sendInvitation(
    @Param('id') id: string,
    @Body() invitationDto: InvitationDto,
  ) {
    return this.organizationService.inviteUser(id, invitationDto);
  }

  @Get('invitations/pending')
  @ApiOperation({ summary: 'Get all pending invitations for the current user' })
  @ApiResponse({
    status: 200,
    description:
      'Returns all organizations where the user has pending invitations',
  })
  getPendingInvitations(@CurrentUser('email') userEmail: string) {
    return this.organizationService.getPendingInvitations(userEmail);
  }

  @Post(':id/invitations/respond')
  @ApiOperation({ summary: 'Accept or reject an organization invitation' })
  @ApiResponse({
    status: 200,
    description: 'Invitation response processed successfully',
  })
  respondToInvitation(
    @Param('id') id: string,
    @Body() responseDto: InvitationResponseDto,
    @CurrentUser('email') userEmail: string,
  ) {
    return this.organizationService.respondToInvitation(
      id,
      userEmail,
      responseDto.response,
    );
  }
}
