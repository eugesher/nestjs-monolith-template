import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IReminderAccessFindOwnedQuery,
  IReminderAccessRecord,
  IReminderAccessRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findOwned(
    query: IReminderAccessFindOwnedQuery,
  ): Promise<Nullable<IReminderAccessRecord>> {
    return await this.createReminderBuilder().forOwned(query).getOne();
  }
}
