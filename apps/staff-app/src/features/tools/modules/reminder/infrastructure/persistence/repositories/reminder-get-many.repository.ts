import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IReminderGetManyRepositoryPort,
  IReminderGetManyRecord,
  IReminderGetManyListQuery,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderGetManyRepository
  extends ReminderPersistenceHost
  implements IReminderGetManyRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: IReminderGetManyListQuery): Promise<IReminderGetManyRecord> {
    return await this.createReminderBuilder().forList(query).getManyAndCount();
  }
}
