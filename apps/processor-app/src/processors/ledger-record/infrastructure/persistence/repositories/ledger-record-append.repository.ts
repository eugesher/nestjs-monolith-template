import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { MysqlErrorHelper, RepositoryHost } from '@acme-libs/database';
import { LedgerEntry } from '@acme-core/entities';

import { LedgerRecordEntryModel } from '../../../domain';
import {
  type ILedgerRecordAppendRepositoryPort,
  ILedgerRecordAppendOutcomeView,
} from '../../../outbound';

@Injectable()
export class LedgerRecordAppendRepository implements ILedgerRecordAppendRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get ledgerEntryRepository(): Repository<LedgerEntry> {
    return this.repositoryHost.getRepository(LedgerEntry);
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
