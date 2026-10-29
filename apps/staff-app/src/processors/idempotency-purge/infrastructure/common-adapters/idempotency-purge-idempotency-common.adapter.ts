import { Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_COMMON_PORT,
  type IIdempotencyCommonPort,
} from '@acme-staff-contracts/idempotency';
import { IIdempotencyPurgeIdempotencyPort } from '../../outbound';

@Injectable()
export class IdempotencyPurgeIdempotencyCommonAdapter implements IIdempotencyPurgeIdempotencyPort {
  constructor(
    @Inject(IDEMPOTENCY_COMMON_PORT)
    private readonly idempotency: IIdempotencyCommonPort,
  ) {}

  public async purgeExpired(): Promise<void> {
    await this.idempotency.purgeExpired();
  }
}
