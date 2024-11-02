import { AbstractRepository } from "src/database/abstract.repository";
import { Task } from "./schemas";
import { Logger } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model } from "mongoose";


export class TaskRepository extends AbstractRepository<Task> {
  protected readonly logger = new Logger(TaskRepository.name);
  constructor(
    @InjectModel(Task.name) taskModel: Model<Task>,
    @InjectConnection() connection: Connection,
  ) {
    super(taskModel, connection);
  }

}
