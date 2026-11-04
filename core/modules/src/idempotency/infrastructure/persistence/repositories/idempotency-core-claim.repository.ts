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
  IIdempotencyCoreKeyFoundRecord,
  IIdempotencyCoreKeyInsertQuery,
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

  public async insert(query: IIdempotencyCoreKeyInsertQuery): Promise<void> {
    await this.idempotencyKeyRepository.insert(query);
  }

  public async findByKey(key: string): Promise<Nullable<IIdempotencyCoreKeyFoundRecord>> {
    return await this.idempotencyKeyRepository
      .createQueryBuilder('IdempotencyKey')
      .select([
        'IdempotencyKey.id',
        'IdempotencyKey.idempotencyKey',
        'IdempotencyKey.requestFingerprint',
        'IdempotencyKey.status',
        'IdempotencyKey.responseBody',
        'IdempotencyKey.createdAt',
      ])
      .where('IdempotencyKey.idempotencyKey = :key', { key })
      .getOne();
  }
}
