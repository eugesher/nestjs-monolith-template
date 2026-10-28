import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { LedgerEntry } from '@acme-core/entities';
import { IPage } from '@acme-libs/toolkit';
import { LedgerCoreEntryModel } from '../../../domain';
import {
  ILedgerCoreEntryPageQuery,
  type ILedgerCoreListEntriesRepositoryPort,
} from '../../../outbound';
import { LedgerCoreEntryMapper } from '../mappers/ledger-core-entry.mapper';

@Injectable()
export class LedgerCoreListEntriesRepository implements ILedgerCoreListEntriesRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get entries(): Repository<LedgerEntry> {
    return this.txHost.tx.getRepository(LedgerEntry);
  }

  public async list(query: ILedgerCoreEntryPageQuery): Promise<IPage<LedgerCoreEntryModel>> {
    const { page, size, subjectType, subjectId, correlationId } = query;
    const bySubjectType = subjectType === undefined ? {} : { subjectType };
    const bySubjectId = subjectId === undefined ? {} : { subjectId };
    const byCorrelationId = correlationId === undefined ? {} : { correlationId };
    const [entries, total] = await this.entries.findAndCount({
      where: { ...bySubjectType, ...bySubjectId, ...byCorrelationId },
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });

    return {
      items: entries.map((entry) => LedgerCoreEntryMapper.toModel(entry)),
      total,
      page,
      size,
    };
  }
}
