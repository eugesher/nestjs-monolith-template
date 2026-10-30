import { Injectable } from '@nestjs/common';

import {
  IIdempotencyCorePurgeExpiredCommand,
  IIdempotencyCorePurgeExpiredView,
  IIdempotencyCorePurgePort,
} from '@acme-core/contracts/idempotency';
import { IdempotencyCorePurgeExpiredUseCase } from '../application';

@Injectable()
export class IdempotencyCorePurgeFacade implements IIdempotencyCorePurgePort {
  constructor(private readonly idempotencyCorePurgeExpired: IdempotencyCorePurgeExpiredUseCase) {}

  public purgeExpired(
    command: IIdempotencyCorePurgeExpiredCommand,
  ): Promise<IIdempotencyCorePurgeExpiredView> {
    return this.idempotencyCorePurgeExpired.execute(command);
  }
}
