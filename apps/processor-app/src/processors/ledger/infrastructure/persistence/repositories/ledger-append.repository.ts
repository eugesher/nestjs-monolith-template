import { Inject, Injectable } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { LedgerEntry } from '@acme-core/entities';

import {
  ILedgerAppendRepositoryPort,
  ILedgerAppendEntryRecord,
  ILedgerAppendEntryInsertQuery,
} from '../../../outbound';

@Injectable()
export class LedgerAppendRepository implements ILedgerAppendRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get ledgerEntryRepository(): IHostedRepository<LedgerEntry> {
    return this.repositoryHost.getRepository(LedgerEntry);
  }

  public async insert(record: ILedgerAppendEntryInsertQuery): Promise<string> {
    const payload = record.payload as QueryDeepPartialEntity<LedgerEntry>['payload'];

    return await this.ledgerEntryRepository.insertOne({ ...record, payload });
  }

  public async findByOperationKey(operationKey: string): Promise<ILedgerAppendEntryRecord> {
    return await this.ledgerEntryRepository
      .createQueryBuilder('LedgerEntry')
      .select(['LedgerEntry.id'])
      .where('LedgerEntry.operationKey = :operationKey', { operationKey })
      .getOneOrFail();
  }
}
