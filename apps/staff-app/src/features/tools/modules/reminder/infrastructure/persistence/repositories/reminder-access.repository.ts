import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import {
  IReminderAccessFindOwnedQuery,
  IReminderAccessRepositoryPort,
  IReminderAccessRecord,
} from '../../../outbound';

@Injectable()
export class ReminderAccessRepository implements IReminderAccessRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): IHostedRepository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async findOwned(
    query: IReminderAccessFindOwnedQuery,
  ): Promise<Nullable<IReminderAccessRecord>> {
    const { reminderId, ownerId } = query;

    return await this.reminderRepository
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
      .where('Reminder.id = :reminderId', { reminderId })
      .andWhere('Reminder.ownerId = :ownerId', { ownerId })
      .getOne();
  }
}
