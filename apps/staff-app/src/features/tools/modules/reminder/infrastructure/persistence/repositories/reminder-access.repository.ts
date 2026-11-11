import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { Nullable } from '@acme-libs/toolkit';

import {
  REMINDER_ACCESS_REPOSITORY_PORT,
  type IReminderAccessFindOwnedQuery,
  type IReminderAccessRecord,
  type IReminderAccessRepositoryPort,
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
