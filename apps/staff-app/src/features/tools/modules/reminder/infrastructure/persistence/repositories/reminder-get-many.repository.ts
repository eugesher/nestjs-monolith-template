import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IPage } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderModel } from '../../../domain';
import { IReminderGetManyRepositoryPort, IReminderPageQuery } from '../../../outbound';

@Injectable()
export class ReminderGetManyRepository implements IReminderGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async list(query: IReminderPageQuery): Promise<IPage<ReminderModel>> {
    const { page, size, ownerId, status } = query;
    const builder = this.reminderRepository
      .createQueryBuilder('Reminder')
      .select([
        'Reminder.id',
        'Reminder.ownerId',
        'Reminder.title',
        'Reminder.body',
        'Reminder.dueOn',
        'Reminder.status',
        'Reminder.version',
        'Reminder.createdAt',
        'Reminder.updatedAt',
      ])
      .where('Reminder.ownerId = :ownerId', { ownerId });

    if (status !== undefined) {
      builder.andWhere('Reminder.status = :status', { status });
    }

    const [reminders, total] = await builder
      .orderBy('Reminder.dueOn', 'ASC')
      .addOrderBy('Reminder.id', 'ASC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      items: reminders.map((reminder) =>
        ReminderModel.reconstitute({
          id: reminder.id,
          ownerId: reminder.ownerId,
          title: reminder.title,
          body: reminder.body,
          dueOn: reminder.dueOn,
          status: reminder.status,
          version: reminder.version,
          createdAt: reminder.createdAt,
          updatedAt: reminder.updatedAt,
        }),
      ),
      total,
      page,
      size,
    };
  }
}
