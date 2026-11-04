import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import {
  IReminderFoundRecord,
  IReminderWriteRepositoryPort,
  IReminderWriteUpdateQuery,
} from '../../../outbound';

@Injectable()
export class ReminderWriteRepository implements IReminderWriteRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): IHostedRepository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async findById(reminderId: string): Promise<Nullable<IReminderFoundRecord>> {
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
      .getOne();
  }

  public async update(query: IReminderWriteUpdateQuery): Promise<boolean> {
    const { id, versionAsRead, dueOn, status, version } = query;
    const result = await this.reminderRepository.update(
      { id, version: versionAsRead },
      { dueOn, status, version },
    );

    return result.affected === 1;
  }
}
