import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../modules/auth/entities/user.entity';
import { CreateTaskDTO } from '../dtos/create-task.dto';
import { GetTasksFilterDTO } from '../dtos/get-tasks-filter.dto';
import { Task, TaskStatus } from '../entities/task.entity';
import { TasksRepository } from '../repositories/tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
  ) {}

  async getTasks(filterDTO: GetTasksFilterDTO, user: User): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDTO, user);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const taskFound = await this.tasksRepository.findOne({
      id,
      user,
    });

    if (!taskFound) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }

    return taskFound;
  }

  async createTask(createTaskDTO: CreateTaskDTO, user: User): Promise<Task> {
    return this.tasksRepository.createTask(createTaskDTO, user);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const { affected } = await this.tasksRepository.delete({ id, user });

    if (affected === 0)
      throw new NotFoundException(`Task with id "${id}" not found`);
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;

    await this.tasksRepository.save(task);

    return task;
  }
}
