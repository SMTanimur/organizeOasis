import { ActionService } from './action.service';
import { ActionController } from './action.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Action, ActionSchema } from './schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Action.name, schema: ActionSchema }]),
    ],
    controllers: [
        ActionController, ],
    providers: [
        ActionService, ],
})
export class ActionModule {}
