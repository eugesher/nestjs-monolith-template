import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Maybe } from '@acme-libs/toolkit';

import { IReminderGetSummaryRepositoryPort, IReminderGetSummaryRecord } from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderGetSummaryRepository
  extends ReminderPersistenceHost
  implements IReminderGetSummaryRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async summarize(ownerId: string): Promise<Maybe<IReminderGetSummaryRecord>> {
    return await this.createReminderBuilder()
      .forSummarize(ownerId)
      .getRawOne<IReminderGetSummaryRecord>();
  }
}
