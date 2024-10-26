import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../common/guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiTags } from '@nestjs/swagger';
import { Organization } from './schemas';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization';
import { Request } from 'express';
import { CurrentUser, UserDto } from '../../common';
import { Types } from 'mongoose';

@UseGuards(RolesGuard, AuthenticatedGuard)
@ApiTags(Organization.name)
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: UserDto,
  ) {
    createOrganizationDto.owner = new Types.ObjectId(user._id);
    return await this.organizationService.create(createOrganizationDto);
  }
}
