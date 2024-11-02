import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '../../database/abstract.repository';
import { Group } from './schemas';


@Injectable()
export class GroupRepository extends AbstractRepository<Group> {
  protected readonly logger = new Logger(Group.name);

  constructor(
    @InjectModel(Group.name) groupModel: Model<Group>,
    @InjectConnection() connection: Connection,
  ) {
    super(groupModel, connection);
  }
}