import { Injectable } from '@nestjs/common';

import {
  IIdempotencyCoreClaimCommand,
  IIdempotencyCoreClaimView,
  IIdempotencyCoreCompleteCommand,
  IIdempotencyCoreKeyPort,
  IIdempotencyCoreReleaseCommand,
} from '@acme-core/contracts/idempotency';
import {
  IdempotencyCoreClaimUseCase,
  IdempotencyCoreCompleteUseCase,
  IdempotencyCoreReleaseUseCase,
} from '../application';

@Injectable()
export class IdempotencyCoreKeyFacade implements IIdempotencyCoreKeyPort {
  constructor(
    private readonly idempotencyCoreClaim: IdempotencyCoreClaimUseCase,
    private readonly idempotencyCoreComplete: IdempotencyCoreCompleteUseCase,
    private readonly idempotencyCoreRelease: IdempotencyCoreReleaseUseCase,
  ) {}

  public claim(command: IIdempotencyCoreClaimCommand): Promise<IIdempotencyCoreClaimView> {
    return this.idempotencyCoreClaim.execute(command);
  }

  public complete(command: IIdempotencyCoreCompleteCommand): Promise<void> {
    return this.idempotencyCoreComplete.execute(command);
  }

  public release(command: IIdempotencyCoreReleaseCommand): Promise<void> {
    return this.idempotencyCoreRelease.execute(command);
  }
}
