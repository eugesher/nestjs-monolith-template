import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import { ReminderModel } from '../../../domain';
import { IReminderAccessFindOwnedQuery, IReminderAccessRepositoryPort } from '../../../outbound';

@Injectable()
export class ReminderAccessRepository implements IReminderAccessRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async findOwned(query: IReminderAccessFindOwnedQuery): Promise<Nullable<ReminderModel>> {
    const { reminderId, ownerId } = query;
    const reminder = await this.reminderRepository
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

    if (reminder === null) {
      return null;
    }

    return ReminderModel.reconstitute({
      id: reminder.id,
      ownerId: reminder.ownerId,
      title: reminder.title,
      body: reminder.body,
      dueOn: reminder.dueOn,
      status: reminder.status,
      version: reminder.version,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    });
  }
}
