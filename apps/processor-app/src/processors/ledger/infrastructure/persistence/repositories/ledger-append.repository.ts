import { Inject, Injectable, type ClassProvider } from '@nestjs/common';
import type { QueryDeepPartialEntity } from 'typeorm';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';
import type { LedgerEntry } from '@acme-core/entities';

import {
  LEDGER_APPEND_REPOSITORY_PORT,
  LedgerAppendEntryInsertOutcomeEnum,
  type ILedgerAppendEntryInsertQuery,
  type ILedgerAppendEntryInsertRecord,
  type ILedgerAppendEntryRecord,
  type ILedgerAppendRepositoryPort,
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

  public async insert(
    record: ILedgerAppendEntryInsertQuery,
  ): Promise<ILedgerAppendEntryInsertRecord> {
    const payload = record.payload as QueryDeepPartialEntity<LedgerEntry>['payload'];

    try {
      const id = await this.ledgerEntryRepository.insertOne({ ...record, payload });

      return { outcome: LedgerAppendEntryInsertOutcomeEnum.INSERTED, id };
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return { outcome: LedgerAppendEntryInsertOutcomeEnum.DUPLICATE };
      }

      throw error;
    }
  }

  public async findByOperationKey(operationKey: string): Promise<ILedgerAppendEntryRecord> {
    return await this.createLedgerEntryBuilder().forByOperationKey(operationKey).getOneOrFail();
  }
}
