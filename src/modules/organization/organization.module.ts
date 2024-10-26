import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './schemas';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
    ],
    controllers: [
        OrganizationController, ],
    providers: [
        OrganizationService, ],
})
export class OrganizationModule {}
