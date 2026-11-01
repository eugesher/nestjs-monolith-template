import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { IPage } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderModel } from '../../../domain';
import { type IReminderCrudRepositoryPort, IReminderPageQuery } from '../../../outbound';
import { ReminderMapper } from '../mappers/reminder.mapper';

@Injectable()
export class ReminderCrudRepository implements IReminderCrudRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

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
