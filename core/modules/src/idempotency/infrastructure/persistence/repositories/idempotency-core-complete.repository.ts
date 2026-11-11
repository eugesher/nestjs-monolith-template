import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IDEMPOTENCY_CORE_COMPLETE_REPOSITORY_PORT,
  type IIdempotencyCoreCompleteQuery,
  type IIdempotencyCoreCompleteRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
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
