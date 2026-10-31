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

  public async claim(command: IIdempotencyCoreClaimCommand): Promise<IIdempotencyCoreClaimView> {
    return await this.idempotencyCoreClaim.execute(command);
  }

  public async complete(command: IIdempotencyCoreCompleteCommand): Promise<void> {
    await this.idempotencyCoreComplete.execute(command);
  }

  public async release(command: IIdempotencyCoreReleaseCommand): Promise<void> {
    await this.idempotencyCoreRelease.execute(command);
  }
}
