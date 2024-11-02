import { GroupService } from './group.service';
import { GroupController } from './group.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from './schemas';
import { GroupRepository } from './group.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService,GroupRepository],
})
export class GroupModule {}
