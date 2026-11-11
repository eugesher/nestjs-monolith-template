import { SelectQueryBuilder } from 'typeorm';

import type { IdempotencyKey } from '@acme-core/entities';

export class IdempotencyCorePersistenceIdempotencyKeyBuilder extends SelectQueryBuilder<IdempotencyKey> {
  public forByKey(key: string): this {
    this.select([
      `${this.alias}.id`,
      `${this.alias}.requestFingerprint`,
      `${this.alias}.status`,
      `${this.alias}.responseBody`,
    ]).where(`${this.alias}.idempotencyKey = :key`, { key });

    return this;
  }
}
