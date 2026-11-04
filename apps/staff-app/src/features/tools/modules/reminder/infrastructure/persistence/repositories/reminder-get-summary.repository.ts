import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
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

  public async summarize(ownerId: string): Promise<IReminderSummarySnapshotRecord> {
    const row = await this.reminderRepository
      .createQueryBuilder('Reminder')
      .select('COUNT(*)', 'pending')
      .addSelect('MIN(Reminder.dueOn)', 'nextDueOn')
      .where('Reminder.ownerId = :ownerId', { ownerId })
      .andWhere('Reminder.status = :status', { status: ReminderStatusEnum.PENDING })
      .getRawOne<{ pending: number | string; nextDueOn: Nullable<string> }>();

    return { pending: Number(row?.pending ?? 0), nextDueOn: row?.nextDueOn ?? null };
  }
}
