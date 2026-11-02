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
    const bySubjectType = subjectType === undefined ? {} : { subjectType };
    const bySubjectId = subjectId === undefined ? {} : { subjectId };
    const byCorrelationId = correlationId === undefined ? {} : { correlationId };
    const [entries, total] = await this.ledgerEntryRepository.findAndCount({
      where: { ...bySubjectType, ...bySubjectId, ...byCorrelationId },
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: entries.map((entry) => LedgerEntryMapper.toView(entry)),
      total,
      page,
      size,
    };
  }
}
