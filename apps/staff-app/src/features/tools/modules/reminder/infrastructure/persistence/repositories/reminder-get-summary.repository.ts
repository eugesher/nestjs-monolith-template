import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';
import { Reminder } from '@acme-staff/common/entities';

import {
  type IReminderGetSummaryRepositoryPort,
  IReminderSummarySnapshotView,
} from '../../../outbound';

@Injectable()
export class ReminderGetSummaryRepository implements IReminderGetSummaryRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get reminderRepository(): Repository<Reminder> {
    return this.transactionHost.tx.getRepository(Reminder);
  }

  public async summarize(ownerId: string): Promise<IReminderSummarySnapshotView> {
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
