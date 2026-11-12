import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { MysqlErrorHelper, type Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IDEMPOTENCY_CORE_CLAIM_REPOSITORY_PORT,
  IdempotencyCoreClaimInsertOutcomeEnum,
  type IIdempotencyCoreClaimFindQuery,
  type IIdempotencyCoreClaimInsertQuery,
  type IIdempotencyCoreClaimRecord,
  type IIdempotencyCoreClaimRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async insert(
    query: IIdempotencyCoreClaimInsertQuery,
  ): Promise<IdempotencyCoreClaimInsertOutcomeEnum> {
    try {
      await this.idempotencyKeyRepository.insert(query);

      return IdempotencyCoreClaimInsertOutcomeEnum.INSERTED;
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        return IdempotencyCoreClaimInsertOutcomeEnum.DUPLICATE;
      }

      throw error;
    }
  }

  public async findByKey(
    query: IIdempotencyCoreClaimFindQuery,
  ): Promise<Nullable<IIdempotencyCoreClaimRecord>> {
    const { scope, key } = query;

    return await this.createIdempotencyKeyBuilder().forByKey(scope, key).getOne();
  }
}
