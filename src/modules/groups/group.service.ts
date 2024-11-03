
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GroupRepository } from './group.repository';
import { CreateGroupDto } from './dto/create-group-dto';
import { UpdateGroupDto } from './dto/update-group-dto';
import { Group } from './schemas';

@Injectable()
export class GroupService {

  constructor(
    private readonly groupRepository: GroupRepository
    
  ) {}

  async createGroup(createGroupDto: CreateGroupDto): Promise<{message: string}> {
    const session = await this.groupRepository.startTransaction();
    try {
     
      await this.groupRepository.create(createGroupDto, { session });
      await session.commitTransaction();
      return { message: 'Group created successfully' };
     
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create group');

    }
  }

 async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<{message: string}> {
  const session = await this.groupRepository.startTransaction();
  try {
    const group = await this.groupRepository.findOne({_id: id});
    if(!group) throw new NotFoundException('Group not found');
    await this.groupRepository.findOneAndUpdate({_id: id}, updateGroupDto);
    await session.commitTransaction();
    return { message: 'Group updated successfully' };
  } catch (error) {
    await session.abortTransaction();
    throw new InternalServerErrorException('Failed to update group');
  }

}

 async deleteGroup(id: string): Promise<{message: string}> {
 
  try {
    const group = await this.groupRepository.findOne({_id: id});
    if(!group) throw new NotFoundException('Group not found');
    await this.groupRepository.findOneAndRemove({_id: id});
   
    return { message: 'Group deleted successfully' };
  } catch (error) {

    throw new InternalServerErrorException('Failed to delete group');
  }
}

async getGroupById(id: string): Promise<Group> {
  const group = await this.groupRepository.findOne({_id: id});
  if(!group) throw new NotFoundException('Group not found');
  return group;
}

async getAllGroups(): Promise<Group[]> {
  return await this.groupRepository.find({})
}


}    
