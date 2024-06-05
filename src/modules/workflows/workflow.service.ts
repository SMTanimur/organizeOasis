import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workflow, WorkflowDocument } from './schemas';
import { Model } from 'mongoose';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
  ) {}

  async createWorkflow(input: CreateWorkflowDto):Promise<Workflow>{
     try {

      const workflow = await this.workflowModel.create(input);
      return workflow;
      
     } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
     }
  };


  async findAll(): Promise<Workflow[]> {
    return this.workflowModel.find().exec();
  }
  async findOne(id: string): Promise<Workflow> {
    return this.workflowModel.findById(id).exec();
  }

  async update(id: string, input: UpdateWorkflowDto): Promise<Workflow> {
    try {
      const workflow = await this.workflowModel.findById(id)
      if(!workflow) throw new NotFoundException('Workflow not found');
      return await this.workflowModel.findOneAndUpdate({_id:id},input)
    } catch (error) {
       throw new BadRequestException(error)
    }
 
  }

}
