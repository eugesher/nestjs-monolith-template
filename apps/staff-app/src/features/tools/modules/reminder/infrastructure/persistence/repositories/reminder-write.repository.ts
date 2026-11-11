import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  REMINDER_WRITE_REPOSITORY_PORT,
  type IReminderWriteRecord,
  type IReminderWriteRepositoryPort,
  type IReminderWriteUpdateQuery,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderWriteRepository
  extends ReminderPersistenceHost
  implements IReminderWriteRepositoryPort
{
  public static readonly provider: ClassProvider<IReminderWriteRepositoryPort> = {
    provide: REMINDER_WRITE_REPOSITORY_PORT,
    useClass: ReminderWriteRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findById(reminderId: string): Promise<Nullable<IReminderWriteRecord>> {
    return await this.createReminderBuilder().forById(reminderId).getOne();
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
