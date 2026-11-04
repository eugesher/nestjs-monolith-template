import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Reminder } from '@acme-staff/common/entities';

import {
  IReminderCreateRepositoryPort,
  IReminderFoundRecord,
  IReminderInsertQuery,
} from '../../../outbound';

@Injectable()
export class ReminderCreateRepository implements IReminderCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): IHostedRepository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async insert(query: IReminderInsertQuery): Promise<string> {
    return await this.reminderRepository.insertOne(query);
  }

  public async findInserted(reminderId: string): Promise<IReminderFoundRecord> {
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
      .getOneOrFail();
  }
}
