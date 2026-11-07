import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
  IIdempotencyCoreClaimInsertQuery,
  IIdempotencyCoreClaimRecord,
  IIdempotencyCoreClaimRepositoryPort,
} from '../../../outbound';
import { IdempotencyCorePersistenceHost } from '../host/idempotency-core-persistence.host';

@Injectable()
export class IdempotencyCoreClaimRepository
  extends IdempotencyCorePersistenceHost
  implements IIdempotencyCoreClaimRepositoryPort
{
  public static readonly provider: ClassProvider<IIdempotencyCoreClaimRepositoryPort> = {
    provide: IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
    useClass: IdempotencyCoreClaimRepository,
  };

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
