import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [
        OrganizationController, ],
    providers: [
        OrganizationService, ],
})
export class OrganizationModule {}
