import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import { LedgerEntry } from '@acme-core/entities';

import {
  ILedgerAppendEntryInsertQuery,
  ILedgerAppendEntryRecord,
  ILedgerAppendRepositoryPort,
  LEDGER_APPEND_REPOSITORY_PORT,
} from '../../../outbound';
import { LedgerPersistenceHost } from '../host/ledger-persistence.host';

@Injectable()
export class LedgerAppendRepository
  extends LedgerPersistenceHost
  implements ILedgerAppendRepositoryPort
{
  public static readonly provider: ClassProvider<ILedgerAppendRepositoryPort> = {
    provide: LEDGER_APPEND_REPOSITORY_PORT,
    useClass: LedgerAppendRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async insert(record: ILedgerAppendEntryInsertQuery): Promise<string> {
    const payload = record.payload as QueryDeepPartialEntity<LedgerEntry>['payload'];

    return await this.ledgerEntryRepository.insertOne({ ...record, payload });
  }

  public async findByOperationKey(operationKey: string): Promise<ILedgerAppendEntryRecord> {
    return await this.createLedgerEntryBuilder().forByOperationKey(operationKey).getOneOrFail();
  }
}
