import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Organization } from './schemas';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization';
import { CurrentUser, Role, UserDto } from '../../common';
import { Types } from 'mongoose';
import { UpdateOrganizationDTO } from './dto/update-organization';

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
    return await this.organizationService.getAll();
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
  ) {
    return await this.organizationService.update(id, updateOrganizationDto);
  }

  @ApiOperation({ summary: 'Delete Organization' })
  @UseGuards(RolesGuard)
  @ApiCreatedResponse({ description: 'Delete a Organization' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.organizationService.delete(id);
  }
}
