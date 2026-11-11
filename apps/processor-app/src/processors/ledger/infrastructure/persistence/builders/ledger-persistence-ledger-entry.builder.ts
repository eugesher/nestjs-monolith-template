import { SelectQueryBuilder } from 'typeorm';

import type { LedgerEntry } from '@acme-core/entities';

export class LedgerPersistenceLedgerEntryBuilder extends SelectQueryBuilder<LedgerEntry> {
  public forByOperationKey(operationKey: string): this {
    this.select([`${this.alias}.id`]).where(`${this.alias}.operationKey = :operationKey`, {
      operationKey,
    });

    return this;
  }
}
