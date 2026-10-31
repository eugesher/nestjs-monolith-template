import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { LedgerEntry } from '@acme-core/entities';
import { MysqlErrorHelper } from '@acme-libs/database';
import { LedgerRecordEntryModel } from '../../../domain';
import {
  type ILedgerRecordAppendRepositoryPort,
  ILedgerRecordAppendOutcomeView,
} from '../../../outbound';

@Injectable()
export class LedgerRecordAppendRepository implements ILedgerRecordAppendRepositoryPort {
  constructor(private readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get ledgerEntryRepository(): Repository<LedgerEntry> {
    return this.transactionHost.tx.getRepository(LedgerEntry);
  }

  public async append(entry: LedgerRecordEntryModel): Promise<ILedgerRecordAppendOutcomeView> {
    try {
      const draft = this.ledgerEntryRepository.create({
        operationKey: entry.operationKey,
        subjectType: entry.subjectType,
        subjectId: entry.subjectId,
        action: entry.action,
        payload: entry.payload,
        correlationId: entry.correlationId,
        occurredAt: entry.occurredAt,
      });
      const saved = await this.ledgerEntryRepository.save(draft);

      return { id: String(saved.id), appended: true };
    } catch (error) {
      if (!MysqlErrorHelper.isDuplicateKey(error)) {
        throw error;
      }

      const existing = await this.ledgerEntryRepository.findOneOrFail({
        select: { id: true },
        where: { operationKey: entry.operationKey },
      });

      return { id: existing.id, appended: false };
    }
  }
}
