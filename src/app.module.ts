import { ChatModule } from './modules/chats/chat.module';

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
import { ChatsGateway } from './modules/chats/chat-gateway';

@Module({
  imports: [
    ChatModule,
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
  providers: [AppService,ChatsGateway],
})
export class AppModule {}
