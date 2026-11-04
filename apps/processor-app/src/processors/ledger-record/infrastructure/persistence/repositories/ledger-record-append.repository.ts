import { Inject, Injectable } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { LedgerEntry } from '@acme-core/entities';

import {
  ILedgerRecordAppendRepositoryPort,
  ILedgerRecordEntryFoundRecord,
  ILedgerRecordEntryInsertQuery,
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

  public async insert(record: ILedgerRecordEntryInsertQuery): Promise<string> {
    const payload = record.payload as QueryDeepPartialEntity<LedgerEntry>['payload'];

    return await this.ledgerEntryRepository.insertOne({ ...record, payload });
  }

  public async findByOperationKey(operationKey: string): Promise<ILedgerRecordEntryFoundRecord> {
    return await this.ledgerEntryRepository
      .createQueryBuilder('LedgerEntry')
      .select(['LedgerEntry.id'])
      .where('LedgerEntry.operationKey = :operationKey', { operationKey })
      .getOneOrFail();
  }
}
