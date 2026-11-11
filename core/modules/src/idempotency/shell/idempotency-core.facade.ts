import { Injectable } from '@nestjs/common';

import type {
  IIdempotencyCoreClaimCommand,
  IIdempotencyCoreClaimView,
  IIdempotencyCoreCompleteCommand,
  IIdempotencyCorePort,
  IIdempotencyCoreReleaseCommand,
} from '@acme-core/contracts/idempotency';

import {
  IdempotencyCoreClaimUseCase,
  IdempotencyCoreCompleteUseCase,
  IdempotencyCoreReleaseUseCase,
} from '../application';

@Injectable()
export class IdempotencyCoreFacade implements IIdempotencyCorePort {
  constructor(
    private readonly claim: IdempotencyCoreClaimUseCase,
    private readonly complete: IdempotencyCoreCompleteUseCase,
    private readonly release: IdempotencyCoreReleaseUseCase,
  ) {}

  public async handleClaim(
    command: IIdempotencyCoreClaimCommand,
  ): Promise<IIdempotencyCoreClaimView> {
    return await this.claim.execute(command);
  }

  public async handleComplete(command: IIdempotencyCoreCompleteCommand): Promise<void> {
    await this.complete.execute(command);
  }

  public async handleRelease(command: IIdempotencyCoreReleaseCommand): Promise<void> {
    await this.release.execute(command);
  }
}
