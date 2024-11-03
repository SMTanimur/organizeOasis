/*
https://docs.nestjs.com/providers#services
*/

import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invitation, Organization, OrganizationDocument } from './schemas';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UpdateOrganizationDTO } from './dto/update-organization';
import {
  InvitationDto,
  InvitationResponse,
} from './dto/invitation-response.dto';
import { GetOrganizationDto, OrganizationType } from './dto/get-organization';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<{ message: string ,organization:Organization}> {
    try {
      const organization = await this.organizationModel.create(
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
      return { message: 'Organization created successfully.', organization };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getAll(
    getOrganizationDto: GetOrganizationDto,
  ): Promise<Organization[]> {
    if (getOrganizationDto.type === OrganizationType.OWN) {
      return this.organizationModel.find({ owner: getOrganizationDto.userId });
    }
    return this.organizationModel.find({
      members: { $elemMatch: { user: getOrganizationDto.userId } },
    });
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const exitOrganization = await this.organizationModel.findById(id);
      if (!exitOrganization) {
        new NotFoundException('Organization not found');
      }
      // Delete organization
      await this.organizationModel.findByIdAndDelete(id);

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
        await this.organizationModel.findById(organizationId);
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
    userId: Types.ObjectId,
  ) {
    const organization = await this.organizationModel
      .findOneAndUpdate(
        { _id: id, owner: userId },
        { $set: updateOrganizationDto },
        { new: true },
      )
      .populate('members.user', 'email name');

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return { message: 'Organization updated successfully' };
  }

  async inviteUser(
    organizationId: string,
    invitation: InvitationDto,
  ): Promise<{ message: string }> {
    invitation.status = 'pending';
    invitation.invitedAt = new Date();

    await this.organizationModel.updateOne(
      { _id: organizationId },
      { $push: { members: invitation } },
    );
    return { message: 'User invited successfully' };
  }

  async respondToInvitation(
    organizationId: string,
    userEmail: string,
    response: InvitationResponse,
  ) {
    const organization = await this.organizationModel.findOne({
      _id: organizationId,
      invitations: {
        $elemMatch: {
          email: userEmail,
          status: 'pending',
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('No pending invitation found');
    }

    const invitation = organization.invitations.find(
      (inv) => inv.email === userEmail && inv.status === 'pending',
    );

    if (response === InvitationResponse.ACCEPT) {
      // Add user as member
      organization.members.push({
        user: invitation.invitedBy, // This should be the current user's ID
        role: 'member', // You might want to store the role in the invitation
      });
    }

    // Update invitation status
    invitation.status = response;
    await organization.save();

    return {
      message: `Invitation ${response} successfully`,
      organization: organization,
    };
  }

  async getPendingInvitations(userEmail: string) {
    return this.organizationModel.find({
      invitations: {
        $elemMatch: {
          email: userEmail,
          status: 'pending',
        },
      },
    }).select;
  }
}
