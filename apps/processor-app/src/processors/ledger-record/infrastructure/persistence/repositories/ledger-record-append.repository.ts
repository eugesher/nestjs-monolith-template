import { Inject, Injectable } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { LedgerEntry } from '@acme-core/entities';

import { ILedgerRecordEntryDraft } from '../../../domain';
import {
  ILedgerRecordAppendRepositoryPort,
  ILedgerRecordAppendOutcomeView,
} from '../../../outbound';

@Injectable()
export class LedgerRecordAppendRepository implements ILedgerRecordAppendRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get ledgerEntryRepository(): IHostedRepository<LedgerEntry> {
    return this.repositoryHost.getRepository(LedgerEntry);
  }

  public async append(entry: ILedgerRecordEntryDraft): Promise<ILedgerRecordAppendOutcomeView> {
    try {
      const payload = entry.payload as QueryDeepPartialEntity<LedgerEntry>['payload'];
      const id = await this.ledgerEntryRepository.insertOne({
        operationKey: entry.operationKey,
        subjectType: entry.subjectType,
        subjectId: entry.subjectId,
        action: entry.action,
        payload,
        correlationId: entry.correlationId,
        occurredAt: entry.occurredAt,
      });
      return { id, appended: true };
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        const { operationKey } = entry;
        const existing = await this.ledgerEntryRepository
          .createQueryBuilder('LedgerEntry')
          .select(['LedgerEntry.id'])
          .where('LedgerEntry.operationKey = :operationKey', { operationKey })
          .getOneOrFail();

        return { id: existing.id, appended: false };
      }

      throw error;
    }
  }
}
