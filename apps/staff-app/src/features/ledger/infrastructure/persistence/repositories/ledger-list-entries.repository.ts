import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { LedgerEntry } from '@acme-core/entities';

import {
  ILedgerEntryPageQuery,
  ILedgerListEntriesRepositoryPort,
  ILedgerStoredEntryRecord,
} from '../../../outbound';

@Injectable()
export class LedgerListEntriesRepository implements ILedgerListEntriesRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get ledgerEntryRepository(): IHostedRepository<LedgerEntry> {
    return this.repositoryHost.getRepository(LedgerEntry);
  }

  public async list(query: ILedgerEntryPageQuery): Promise<[ILedgerStoredEntryRecord[], number]> {
    const { limit, offset, subjectType, subjectId, correlationId } = query;
    const builder = this.ledgerEntryRepository
      .createQueryBuilder('LedgerEntry')
      .select([
        'LedgerEntry.id',
        'LedgerEntry.operationKey',
        'LedgerEntry.subjectType',
        'LedgerEntry.subjectId',
        'LedgerEntry.action',
        'LedgerEntry.payload',
        'LedgerEntry.correlationId',
        'LedgerEntry.occurredAt',
        'LedgerEntry.recordedAt',
      ]);

    if (subjectType !== undefined) {
      builder.andWhere('LedgerEntry.subjectType = :subjectType', { subjectType });
    }

    if (subjectId !== undefined) {
      builder.andWhere('LedgerEntry.subjectId = :subjectId', { subjectId });
    }

    if (correlationId !== undefined) {
      builder.andWhere('LedgerEntry.correlationId = :correlationId', { correlationId });
    }

    return await builder
      .orderBy('LedgerEntry.id', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
