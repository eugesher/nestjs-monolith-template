import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { IdempotencyKey } from '@acme-core/entities';

import {
  IIdempotencyCoreClaimRepositoryPort,
  IIdempotencyCoreClaimRecord,
  IIdempotencyCoreClaimInsertQuery,
} from '../../../outbound';

@Injectable()
export class IdempotencyCoreClaimRepository implements IIdempotencyCoreClaimRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get idempotencyKeyRepository(): IHostedRepository<IdempotencyKey> {
    return this.repositoryHost.getRepository(IdempotencyKey);
  }

  public async insert(query: IIdempotencyCoreClaimInsertQuery): Promise<void> {
    await this.idempotencyKeyRepository.insert(query);
  }

  public async findByKey(key: string): Promise<Nullable<IIdempotencyCoreClaimRecord>> {
    return await this.idempotencyKeyRepository
      .createQueryBuilder('IdempotencyKey')
      .select([
        'IdempotencyKey.id',
        'IdempotencyKey.requestFingerprint',
        'IdempotencyKey.status',
        'IdempotencyKey.responseBody',
      ])
      .where('IdempotencyKey.idempotencyKey = :key', { key })
      .getOne();
  }
}
