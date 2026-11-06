import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IReminderAccessFindOwnedQuery,
  IReminderAccessRepositoryPort,
  IReminderAccessRecord,
  REMINDER_ACCESS_REPOSITORY_PORT,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderAccessRepository
  extends ReminderPersistenceHost
  implements IReminderAccessRepositoryPort
{
  public static readonly provider: ClassProvider<IReminderAccessRepositoryPort> = {
    provide: REMINDER_ACCESS_REPOSITORY_PORT,
    useClass: ReminderAccessRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findOwned(
    query: IReminderAccessFindOwnedQuery,
  ): Promise<Nullable<IReminderAccessRecord>> {
    return await this.createReminderBuilder().forOwned(query).getOne();
  }
}
