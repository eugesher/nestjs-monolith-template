import { SelectQueryBuilder } from 'typeorm';

import type { LedgerEntry } from '@acme-core/entities';

import type { ILedgerListEntriesQuery } from '../../../outbound';

export class LedgerPersistenceLedgerEntryBuilder extends SelectQueryBuilder<LedgerEntry> {
  public forList(query: ILedgerListEntriesQuery): this {
    const { limit, offset, subjectType, subjectId, correlationId } = query;

    this.select([
      `${this.alias}.id`,
      `${this.alias}.operationKey`,
      `${this.alias}.subjectType`,
      `${this.alias}.subjectId`,
      `${this.alias}.action`,
      `${this.alias}.payload`,
      `${this.alias}.correlationId`,
      `${this.alias}.occurredAt`,
      `${this.alias}.recordedAt`,
    ]);

    if (subjectType !== undefined) {
      this.andWhere(`${this.alias}.subjectType = :subjectType`, { subjectType });
    }

    if (subjectId !== undefined) {
      this.andWhere(`${this.alias}.subjectId = :subjectId`, { subjectId });
    }

    if (correlationId !== undefined) {
      this.andWhere(`${this.alias}.correlationId = :correlationId`, { correlationId });
    }

    this.orderBy(`${this.alias}.id`, 'DESC').skip(offset).take(limit);

    return this;
  }
}
