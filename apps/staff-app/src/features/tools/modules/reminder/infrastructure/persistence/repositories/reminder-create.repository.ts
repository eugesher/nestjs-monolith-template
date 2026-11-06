import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IReminderCreateRepositoryPort,
  IReminderCreateRecord,
  IReminderCreateInsertQuery,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderCreateRepository
  extends ReminderPersistenceHost
  implements IReminderCreateRepositoryPort
{
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
