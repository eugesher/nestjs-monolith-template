import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IReminderCreateInsertQuery,
  IReminderCreateRecord,
  IReminderCreateRepositoryPort,
  REMINDER_CREATE_REPOSITORY_PORT,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderCreateRepository
  extends ReminderPersistenceHost
  implements IReminderCreateRepositoryPort
{
  public static readonly provider: ClassProvider<IReminderCreateRepositoryPort> = {
    provide: REMINDER_CREATE_REPOSITORY_PORT,
    useClass: ReminderCreateRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async insert(query: IReminderCreateInsertQuery): Promise<string> {
    return await this.reminderRepository.insertOne(query);
  }

  public async findInserted(reminderId: string): Promise<IReminderCreateRecord> {
    return await this.createReminderBuilder().forInserted(reminderId).getOneOrFail();
  }
}
