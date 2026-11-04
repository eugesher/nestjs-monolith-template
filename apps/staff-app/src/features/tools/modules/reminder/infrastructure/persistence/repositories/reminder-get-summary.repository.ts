import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import {
  IReminderGetSummaryRepositoryPort,
  IReminderSummarySnapshotRecord,
} from '../../../outbound';

@Injectable()
export class ReminderGetSummaryRepository implements IReminderGetSummaryRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get reminderRepository(): IHostedRepository<Reminder> {
    return this.repositoryHost.getRepository(Reminder);
  }

  public async summarize(ownerId: string): Promise<Maybe<IReminderSummarySnapshotRecord>> {
    return await this.reminderRepository
      .createQueryBuilder('Reminder')
      .select('COUNT(*)', 'pending')
      .addSelect('MIN(Reminder.dueOn)', 'nextDueOn')
      .where('Reminder.ownerId = :ownerId', { ownerId })
      .andWhere('Reminder.status = :status', { status: ReminderStatusEnum.PENDING })
      .getRawOne<IReminderSummarySnapshotRecord>();
  }
}
