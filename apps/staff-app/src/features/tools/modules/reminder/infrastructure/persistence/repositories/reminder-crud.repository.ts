import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IPage } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderModel } from '../../../domain';
import { type IReminderCrudRepositoryPort, IReminderPageQuery } from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderCrudRepository implements IReminderCrudRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async list(query: IReminderPageQuery): Promise<IPage<ReminderModel>> {
    const { page, size, ownerId, status } = query;
    const byStatus = status === undefined ? {} : { status };
    const [reminders, total] = await this.reminderRepository.findAndCount({
      where: { ownerId, ...byStatus },
      order: { dueOn: 'ASC', id: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: reminders.map((reminder) => ReminderMapper.toModel(reminder)),
      total,
      page,
      size,
    };
  }
}
