import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Reminder } from '@acme-staff/common/entities';

import {
  IReminderGetManyRepositoryPort,
  IReminderGetManyRecord,
  IReminderGetManyListQuery,
} from '../../../outbound';

@Injectable()
export class ReminderGetManyRepository implements IReminderGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): IHostedRepository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async list(query: IReminderGetManyListQuery): Promise<IReminderGetManyRecord> {
    const { limit, offset, ownerId, status } = query;
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

    return await builder
      .orderBy('Reminder.dueOn', 'ASC')
      .addOrderBy('Reminder.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
