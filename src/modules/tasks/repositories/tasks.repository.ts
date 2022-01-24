import { InternalServerErrorException, Logger } from '@nestjs/common';
import { User } from '../../../modules/auth/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateTaskDTO } from '../dtos/create-task.dto';
import { GetTasksFilterDTO } from '../dtos/get-tasks-filter.dto';
import { Task, TaskStatus } from '../entities/task.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  private logger = new Logger('TasksRepository', { timestamp: true });

  async getTasks(filterDTO: GetTasksFilterDTO, user: User): Promise<Task[]> {
    const { status, search } = filterDTO;
    const query = this.createQueryBuilder('tasks');

    query.where({ user });

    if (status) {
      query.andWhere('tasks.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(tasks.title) LIKE LOWER(:search) OR LOWER(tasks.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (err) {
      this.logger.error(
        `Failed to get tasks for user "${user.id} ${user.username}".
        Filters: ${JSON.stringify(filterDTO)}`,
        err.stack,
      );

      throw new InternalServerErrorException();
    }
  }

  async createTask(
    { title, description }: CreateTaskDTO,
    user: User,
  ): Promise<Task> {
    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.save(task);

    return task;
  }
}
