import { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';
import { IdempotencyKey } from '@acme-core/entities';

export abstract class IdempotencyPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.orm.getRepository(IdempotencyKey);
  }
}
