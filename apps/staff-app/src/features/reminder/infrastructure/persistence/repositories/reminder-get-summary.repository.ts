import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Reminder } from '@acme-core/entities';
import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import {
  type IReminderGetSummaryRepositoryPort,
  IReminderSummarySnapshotView,
} from '../../../outbound';

@Injectable()
export class ReminderGetSummaryRepository implements IReminderGetSummaryRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminders(): Repository<Reminder> {
    return this.txHost.tx.getRepository(Reminder);
  }

  public async summarize(ownerId: string): Promise<IReminderSummarySnapshotView> {
    const row = await this.reminders
      .createQueryBuilder('reminder')
      .select('COUNT(*)', 'pending')
      .addSelect('MIN(reminder.dueOn)', 'nextDueOn')
      .where('reminder.ownerId = :ownerId', { ownerId })
      .andWhere('reminder.status = :status', { status: ReminderStatusEnum.PENDING })
      .getRawOne<{ pending: number | string; nextDueOn: Nullable<string> }>();

    return { pending: Number(row?.pending ?? 0), nextDueOn: row?.nextDueOn ?? null };
  }
}
