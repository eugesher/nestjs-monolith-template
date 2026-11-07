import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT,
  IIdempotencyCoreCompleteQuery,
  IIdempotencyCoreCompleteRepositoryPort,
} from '../../../outbound';
import { IdempotencyCorePersistenceHost } from '../host/idempotency-core-persistence.host';

@Injectable()
export class IdempotencyCoreCompleteRepository
  extends IdempotencyCorePersistenceHost
  implements IIdempotencyCoreCompleteRepositoryPort
{
  public static readonly provider: ClassProvider<IIdempotencyCoreCompleteRepositoryPort> = {
    provide: IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT,
    useClass: IdempotencyCoreCompleteRepository,
  };

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
