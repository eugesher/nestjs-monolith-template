import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { IdempotencyKey } from '@acme-core/entities';

export abstract class IdempotencyPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }
}
