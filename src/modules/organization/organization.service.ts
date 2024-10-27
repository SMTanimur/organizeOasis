/*
https://docs.nestjs.com/providers#services
*/

import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Organization, OrganizationDocument } from './schemas';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UpdateOrganizationDTO } from './dto/update-organization';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizetionModel: Model<OrganizationDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<{ message: string }> {
    try {
      const organization = await this.organizetionModel.create(
        createOrganizationDto,
      );

      await this.usersService.update({
        userId: new Types.ObjectId(organization.owner).toString(),
        organizations: [
          {
            organization: new Types.ObjectId(organization._id.toString()),
            role: 'Owner',
          },
        ],
      });
      return { message: 'Organization created successfully.' };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getAll(): Promise<Organization[]> {
    return this.organizetionModel.find({});
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const exitOrganization = await this.organizetionModel.findById(id);
      if (!exitOrganization) {
        new NotFoundException('Organization not found');
      }
      // Delete organization
      await this.organizetionModel.findByIdAndDelete(id);

      // Update users to remove the organization from their profile
      await this.usersService.removeOrganizationFromUsers(id);

      return {
        message: `Organization ${exitOrganization.name} deleted successfully`,
      };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getOrganization(organizationId: string): Promise<Organization> {
    try {
      const exitOrganization =
        await this.organizetionModel.findById(organizationId);
      if (!exitOrganization) {
        new NotFoundException('Organization not found');
      }
      return exitOrganization;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDTO,
  ): Promise<{ message: string }> {
    try {
      const exitOrganization = await this.organizetionModel.findById(id);
      if (!exitOrganization) {
        new NotFoundException('Organization not found');
      }
      await this.organizetionModel.findByIdAndUpdate(id, updateOrganizationDto);
      return {
        message: `Organization ${exitOrganization.name} updated successfully`,
      };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
}
