import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IPage } from '@acme-libs/toolkit';
import { LedgerEntry } from '@acme-core/entities';

import {
  ILedgerEntryPageQuery,
  type ILedgerListEntriesRepositoryPort,
  ILedgerStoredEntryView,
} from '../../../outbound';
import { LedgerEntryMapper } from '../mappers/ledger-entry.mapper';

@Injectable()
export class LedgerListEntriesRepository implements ILedgerListEntriesRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get ledgerEntryRepository(): Repository<LedgerEntry> {
    return this.repositoryHost.getRepository(LedgerEntry);
  }

  public async list(query: ILedgerEntryPageQuery): Promise<IPage<ILedgerStoredEntryView>> {
    const { page, size, subjectType, subjectId, correlationId } = query;
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

    const [entries, total] = await builder
      .orderBy('LedgerEntry.id', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return {
      items: entries.map((entry) => LedgerEntryMapper.toView(entry)),
      total,
      page,
      size,
    };
  }
}
