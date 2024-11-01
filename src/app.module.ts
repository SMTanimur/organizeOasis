import { GroupModule } from './modules/groups/group.module';
import { ProjectModule } from './modules/projects/project.module';
import { TaskModule } from './modules/tasks/task.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { ActionModule } from './modules/actions/action.module';
import { WorkflowModule } from './modules/workflows/workflow.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    GroupModule,
    ProjectModule,
    TaskModule,
    OrganizationModule,
    ActionModule,
    WorkflowModule,
    ConfigurationModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
