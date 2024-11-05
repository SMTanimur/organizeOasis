import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema, Invitation, InvitationSchema } from './schemas';
import { UsersModule } from '../users/users.module';
import { User } from '../users/schema/user.schema';
import { UserSchema } from '../users/schema/user.schema';
import { Chat, ChatSchema } from '../chats/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Invitation.name, schema: InvitationSchema },
      { name: User.name, schema: UserSchema },
       {name:Chat.name, schema: ChatSchema}
    ]),
    UsersModule
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
