import { IdempotencyKey } from '@acme-core/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

export abstract class IdempotencyPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.orm.getRepository(IdempotencyKey);
  }
}
