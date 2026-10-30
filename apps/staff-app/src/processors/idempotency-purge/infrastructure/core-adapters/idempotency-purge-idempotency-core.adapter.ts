import { Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_PURGE_PORT,
  type IIdempotencyCorePurgePort,
} from '@acme-core/contracts/idempotency';
import { IIdempotencyPurgeIdempotencyPort } from '../../outbound';

@Injectable()
export class IdempotencyPurgeIdempotencyCoreAdapter implements IIdempotencyPurgeIdempotencyPort {
  constructor(
    @Inject(IDEMPOTENCY_CORE_PURGE_PORT)
    private readonly idempotency: IIdempotencyCorePurgePort,
  ) {}

  public async purgeExpired(ttlHours: number): Promise<void> {
    await this.idempotency.purgeExpired({ ttlHours });
  }
}
