import { GroupService } from './group.service';
import { GroupController } from './group.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
