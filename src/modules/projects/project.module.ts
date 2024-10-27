import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas';
import { OrganizationModule } from '../organization/organization.module';
import { UsersModule } from '../users/users.module';
import { Organization, OrganizationSchema } from '../organization/schemas';

@Module({
  imports: [
    OrganizationModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
