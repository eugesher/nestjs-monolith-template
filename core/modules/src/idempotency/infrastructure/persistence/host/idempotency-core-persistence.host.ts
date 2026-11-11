import { IdempotencyKey } from '@acme-core/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { IdempotencyCorePersistenceIdempotencyKeyBuilder } from '../builders/idempotency-core-persistence-idempotency-key.builder';

export abstract class IdempotencyCorePersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.orm.getRepository(IdempotencyKey);
  }

  protected createIdempotencyKeyBuilder(): IdempotencyCorePersistenceIdempotencyKeyBuilder {
    return new IdempotencyCorePersistenceIdempotencyKeyBuilder(
      this.idempotencyKeyRepository.createQueryBuilder(IdempotencyKey.name),
    );
  }
}
