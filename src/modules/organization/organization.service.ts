/*
https://docs.nestjs.com/providers#services
*/

import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Organization, OrganizationDocument } from './schemas';
import { Model } from 'mongoose';
import { CreateOrganizationDto } from './dto/create-organization';

@Injectable()
export class OrganizationService {

  constructor( @InjectModel(Organization.name) private organizetionModel: Model<OrganizationDocument> ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<{message:string}> {

    try {
      const createdOrganization =  await this.organizetionModel.create(createOrganizationDto);
      return { message: 'Organization created successfully.' };
    } catch (error) {
      throw new BadGatewayException(error);
    }
    
  }
}
