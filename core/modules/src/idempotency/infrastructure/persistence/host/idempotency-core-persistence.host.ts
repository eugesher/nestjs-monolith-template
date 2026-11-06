import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { IdempotencyKey } from '@acme-core/entities';
import { IdempotencyCorePersistenceIdempotencyKeyBuilder } from '../builders/idempotency-core-persistence-idempotency-key.builder';

export abstract class IdempotencyCorePersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  protected createIdempotencyKeyBuilder(): IdempotencyCorePersistenceIdempotencyKeyBuilder {
    return new IdempotencyCorePersistenceIdempotencyKeyBuilder(
      this.idempotencyKeyRepository.createQueryBuilder(IdempotencyKey.name),
    );
  }
}
