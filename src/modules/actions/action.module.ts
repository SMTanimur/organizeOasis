import { ActionService } from './action.service';
import { ActionController } from './action.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        ActionController, ],
    providers: [
        ActionService, ],
})
export class ActionModule {}
