import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
  type IIdempotencyCoreReleaseQuery,
  type IIdempotencyCoreReleaseRepositoryPort,
} from '../../../outbound';
import { IdempotencyCorePersistenceHost } from '../host/idempotency-core-persistence.host';

@Injectable()
export class IdempotencyCoreReleaseRepository
  extends IdempotencyCorePersistenceHost
  implements IIdempotencyCoreReleaseRepositoryPort
{
  public static readonly provider: ClassProvider<IIdempotencyCoreReleaseRepositoryPort> = {
    provide: IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
    useClass: IdempotencyCoreReleaseRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async deleteInFlight(query: IIdempotencyCoreReleaseQuery): Promise<void> {
    const { scope, key } = query;

    await this.idempotencyKeyRepository.delete({
      scope,
      idempotencyKey: key,
      status: IdempotencyStatusEnum.IN_FLIGHT,
    });
  }
}
