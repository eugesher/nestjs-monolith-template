import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IReminderWriteRecord,
  IReminderWriteRepositoryPort,
  IReminderWriteUpdateQuery,
  REMINDER_WRITE_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
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
