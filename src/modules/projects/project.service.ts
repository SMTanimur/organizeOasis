/*
https://docs.nestjs.com/providers#services
*/

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas';
import { Model, Types } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { OrganizationService } from '../organization/organization.service';
import { Organization, OrganizationDocument } from '../organization/schemas';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {}

  // Create a new project and add it to the organization
  async createProject(
    createProjectDto: CreateProjectDto,
  ): Promise<{ message: string }> {
    try {
      const createdProject = await this.projectModel.create(createProjectDto);

      // Update the organization with the new project reference
      await this.organizationModel.findOneAndUpdate({
        id: createdProject.organization._id,
      });

      return { message: 'Project created successfully' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // Get a project by ID
  async getProjectById(projectId: string): Promise<Project> {
    const project = await this.projectModel
      .findById(projectId)
      .populate('organization');
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  // Get all projects associated with a specific organization
  async getProjectsByOrganization(organizationId: string): Promise<Project[]> {
    return this.projectModel
      .find({ organization: new Types.ObjectId(organizationId) })
      .exec();
  }

  // Update a project by ID
  async updateProject(
    projectId: string,
    updateData: Partial<CreateProjectDto>,
  ): Promise<{ message: string }> {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectModel.findByIdAndUpdate(projectId, updateData, {
      new: true,
    });
    return { message: `Project ${project.name} updated successfully` };
  }

  // Delete a project by ID and update the organization
  async deleteProject(projectId: string): Promise<{ message: string }> {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectModel.findByIdAndDelete(projectId);

    // Remove the project from the organization
    await this.organizationModel.findOneAndUpdate(
      { _id: project.organization },
      { $pull: { projects: projectId } },
    );

    return { message: `Project ${project.name} deleted successfully` };
  }
}
