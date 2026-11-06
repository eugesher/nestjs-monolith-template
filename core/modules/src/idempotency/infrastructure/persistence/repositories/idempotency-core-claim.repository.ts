import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IIdempotencyCoreClaimRepositoryPort,
  IIdempotencyCoreClaimRecord,
  IIdempotencyCoreClaimInsertQuery,
} from '../../../outbound';
import { IdempotencyCorePersistenceHost } from '../host/idempotency-core-persistence.host';

@Injectable()
export class IdempotencyCoreClaimRepository
  extends IdempotencyCorePersistenceHost
  implements IIdempotencyCoreClaimRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async insert(query: IIdempotencyCoreClaimInsertQuery): Promise<void> {
    await this.idempotencyKeyRepository.insert(query);
  }

  public async findByKey(key: string): Promise<Nullable<IIdempotencyCoreClaimRecord>> {
    return await this.createIdempotencyKeyBuilder().forByKey(key).getOne();
  }
}
