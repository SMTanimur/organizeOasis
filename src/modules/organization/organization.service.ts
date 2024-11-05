/*
https://docs.nestjs.com/providers#services
*/

import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Invitation,
  InvitationDocument,
  MemberRole,
  Organization,
  OrganizationDocument,
} from './schemas';
import { Model, Types } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization';
import { UpdateOrganizationDTO } from './dto/update-organization';
import {
  InvitationDto,
  InvitationResponse,
} from './dto/invitation-response.dto';
import { GetOrganizationDto, OrganizationType } from './dto/get-organization';
import { UserDocument } from '../users/schema/user.schema';
import { User } from '../users/schema/user.schema';
import { UserDto } from '../../common';
import { Chat, ChatDocument } from '../chats/schemas';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<OrganizationDocument>,
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<{ message: string; organization: Organization }> {
    try {
      const organization = await this.organizationModel.create(
        createOrganizationDto,
      );

      await this.userModel.updateOne({
        _id: new Types.ObjectId(organization.owner).toString(),
        $push: { organizations: organization._id },
      });

      await this.organizationModel.updateOne(
        { _id: organization._id },
        {
          $push: {
            members: { user: organization.owner, role: MemberRole.OWNER },
          },
        },
      );

      return { message: 'Organization created successfully.', organization };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }



  async getAll(
    getOrganizationDto: GetOrganizationDto,
  ): Promise<Organization[]> {
    let organizations;
    if (getOrganizationDto.type === OrganizationType.OWN) {
      organizations = await this.organizationModel
        .find({ owner: getOrganizationDto.userId })
        .populate('members.user', 'email firstName lastName avatar');
    } else {
      organizations = await this.organizationModel
        .find({
          members: {
            $elemMatch: {
              user: getOrganizationDto.userId,
              role: { $ne: MemberRole.OWNER },
            },
          },
        })
        .populate('members.user', 'email firstName lastName avatar');
    }

    return organizations.map((org) => {
      const isOwner =
        org.owner.toString() === getOrganizationDto.userId.toString();
      return {
        ...org.toObject(),
        isOwner,
      };
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
      await this.userModel.updateOne({
        _id: exitOrganization.owner,
        $pull: { organizations: id },
      });

      return {
        message: `Organization ${exitOrganization.name} deleted successfully`,
      };
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getOrganization(organizationId: string): Promise<Organization> {
    try {
      const exitOrganization = await this.organizationModel
        .findById(organizationId)
        .populate('members.user', 'email firstName lastName avatar');
      if (!exitOrganization) {
        new NotFoundException('Organization not found');
      }
      return exitOrganization;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }

  async getOraganizationAnalysis(organizationId: string) {
    const organization = await this.organizationModel
      .findById(organizationId)
      .populate('members.user', 'email firstName lastName avatar');
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
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

  // get organization members
  async getOrganizationMembers(
    organizationId: string,
  ): Promise<Organization> {
    const organization = await this.organizationModel
      .findById(organizationId)
      .populate('members.user', 'email firstName lastName avatar');
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
    // return organization.members.map((member) => member.user);
  }

  async inviteUser(invitation: InvitationDto): Promise<{ message: string }> {
    invitation.status = 'pending';
    invitation.invitedAt = new Date();
    const organization = await this.organizationModel.findById(
      invitation.organization,
    );
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await this.invitationModel.create(invitation);
    return { message: 'User invited successfully' };
  }

  async respondToInvitation(
    organizationId: string,
    user: UserDto,
    response: InvitationResponse,
  ) {
    const organization = await this.organizationModel.findById(
      new Types.ObjectId(organizationId),
    );

    if (!organization) {
      throw new NotFoundException('No pending invitation found');
    }

    const invitation = await this.invitationModel.findOne({
      email: user.email,
      status: 'pending',
    });

    if (!invitation) {
      throw new NotFoundException('No pending invitation found');
    }

    if (response === InvitationResponse.ACCEPT) {
      // Add user as member
      organization.members.push({
        user: new Types.ObjectId(user._id),
        role: MemberRole.MEMBER, // You might want to store the role in the invitation
      });
    }

    await this.invitationModel.findByIdAndDelete(invitation._id);
    await organization.save();

    return {
      message: `Invitation ${response} successfully`,
    };
  }

  async getPendingInvitations(userEmail: string) {
    return this.invitationModel
      .find({
        email: userEmail,
        status: 'pending',
      })
      .populate('organization')
      .populate('invitedBy', 'email firstName lastName avatar');
  }
}
