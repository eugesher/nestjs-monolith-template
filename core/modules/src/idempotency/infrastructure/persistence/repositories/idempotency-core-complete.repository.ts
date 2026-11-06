import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';

import {
  IIdempotencyCoreCompleteRepositoryPort,
  IIdempotencyCoreCompleteQuery,
} from '../../../outbound';
import { IdempotencyCorePersistenceHost } from '../host/idempotency-core-persistence.host';

@Injectable()
export class IdempotencyCoreCompleteRepository
  extends IdempotencyCorePersistenceHost
  implements IIdempotencyCoreCompleteRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async complete(query: IIdempotencyCoreCompleteQuery): Promise<void> {
    const { key, responseBody } = query;

    await this.idempotencyKeyRepository.update(
      { idempotencyKey: key },
      { status: IdempotencyStatusEnum.COMPLETED, responseBody },
    );
  }
}
