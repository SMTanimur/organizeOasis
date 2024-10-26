import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }])
  ],
  controllers: [
        ProjectController, ],
  providers: [
        ProjectService, ],
})
export class ProjectModule {}
