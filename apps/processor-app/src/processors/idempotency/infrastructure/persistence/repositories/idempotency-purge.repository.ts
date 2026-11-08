import { ClassProvider, Inject, Injectable } from '@nestjs/common';
import { LessThan } from 'typeorm';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IDEMPOTENCY_PURGE_REPOSITORY_PORT,
  IIdempotencyPurgeRecord,
  IIdempotencyPurgeRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async deleteCreatedBefore(cutoff: Date): Promise<IIdempotencyPurgeRecord> {
    return await this.idempotencyKeyRepository.delete({ createdAt: LessThan(cutoff) });
  }
}
