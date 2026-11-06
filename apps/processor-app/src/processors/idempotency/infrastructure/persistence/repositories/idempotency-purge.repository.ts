import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { LessThan } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IIdempotencyPurgeRecord,
  IIdempotencyPurgeRepositoryPort,
  IDEMPOTENCY_PURGE_REPOSITORY_PORT,
} from '../../../outbound';
import { IdempotencyPersistenceHost } from '../host/idempotency-persistence.host';

@Injectable()
export class IdempotencyPurgeRepository
  extends IdempotencyPersistenceHost
  implements IIdempotencyPurgeRepositoryPort
{
  public static readonly provider: ClassProvider<IIdempotencyPurgeRepositoryPort> = {
    provide: IDEMPOTENCY_PURGE_REPOSITORY_PORT,
    useClass: IdempotencyPurgeRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async deleteCreatedBefore(cutoff: Date): Promise<IIdempotencyPurgeRecord> {
    return await this.idempotencyKeyRepository.delete({ createdAt: LessThan(cutoff) });
  }
}
