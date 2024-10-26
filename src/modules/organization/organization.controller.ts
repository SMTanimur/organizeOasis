import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard } from '../../common/guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Organization } from './schemas';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization';
import { Request } from 'express';
import { CurrentUser, Role, UserDto } from '../../common';
import { Types } from 'mongoose';

@ApiTags(Organization.name)
@UseGuards(RolesGuard)
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @ApiOperation({ summary: 'Create Organization' })
  @UseGuards(AuthenticatedGuard)
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
  @ApiCreatedResponse({ description: 'Get a Organization' })
  @Get()
  async get() {
    return await this.organizationService.getAll()
  }
}
