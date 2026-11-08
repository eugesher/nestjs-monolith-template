import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Maybe } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IReminderGetSummaryRecord,
  IReminderGetSummaryRepositoryPort,
  REMINDER_GET_SUMMARY_REPOSITORY_PORT,
} from '../../../outbound';
import { ReminderPersistenceHost } from '../host/reminder-persistence.host';

@Injectable()
export class ReminderGetSummaryRepository
  extends ReminderPersistenceHost
  implements IReminderGetSummaryRepositoryPort
{
  public static readonly provider: ClassProvider<IReminderGetSummaryRepositoryPort> = {
    provide: REMINDER_GET_SUMMARY_REPOSITORY_PORT,
    useClass: ReminderGetSummaryRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async summarize(ownerId: string): Promise<Maybe<IReminderGetSummaryRecord>> {
    return await this.createReminderBuilder()
      .forSummarize(ownerId)
      .getRawOne<IReminderGetSummaryRecord>();
  }
}
