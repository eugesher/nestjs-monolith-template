import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  REMINDER_GET_MANY_REPOSITORY_PORT,
  type IReminderGetManyListQuery,
  type IReminderGetManyRecord,
  type IReminderGetManyRepositoryPort,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderGetManyRepository
  extends ReminderPersistenceHost
  implements IReminderGetManyRepositoryPort
{
  public static readonly provider: ClassProvider<IReminderGetManyRepositoryPort> = {
    provide: REMINDER_GET_MANY_REPOSITORY_PORT,
    useClass: ReminderGetManyRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async list(query: IReminderGetManyListQuery): Promise<IReminderGetManyRecord> {
    return await this.createReminderBuilder().forList(query).getManyAndCount();
  }
}
