import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { IdempotencyStatusEnum } from '@acme-libs/kernel';

import {
  IIdempotencyCoreReleaseRepositoryPort,
  IDEMPOTENCY_CORE_RELEASE_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async deleteInFlight(key: string): Promise<void> {
    await this.idempotencyKeyRepository.delete({
      idempotencyKey: key,
      status: IdempotencyStatusEnum.IN_FLIGHT,
    });
  }
}
