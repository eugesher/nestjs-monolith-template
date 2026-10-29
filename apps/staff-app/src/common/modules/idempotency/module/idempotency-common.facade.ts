import { Injectable } from '@nestjs/common';

import {
  IIdempotencyCommonClaimCommand,
  IIdempotencyCommonClaimView,
  IIdempotencyCommonCompleteCommand,
  IIdempotencyCommonPort,
  IIdempotencyCommonPurgeExpiredView,
  IIdempotencyCommonReleaseCommand,
} from '@acme-staff-contracts/idempotency';
import {
  IdempotencyCommonClaimUseCase,
  IdempotencyCommonCompleteUseCase,
  IdempotencyCommonPurgeExpiredUseCase,
  IdempotencyCommonReleaseUseCase,
} from '../application';

@Injectable()
export class IdempotencyCommonFacade implements IIdempotencyCommonPort {
  constructor(
    private readonly idempotencyCommonClaim: IdempotencyCommonClaimUseCase,
    private readonly idempotencyCommonComplete: IdempotencyCommonCompleteUseCase,
    private readonly idempotencyCommonRelease: IdempotencyCommonReleaseUseCase,
    private readonly idempotencyCommonPurgeExpired: IdempotencyCommonPurgeExpiredUseCase,
  ) {}

  public claim(command: IIdempotencyCommonClaimCommand): Promise<IIdempotencyCommonClaimView> {
    return this.idempotencyCommonClaim.execute(command);
  }

  public complete(command: IIdempotencyCommonCompleteCommand): Promise<void> {
    return this.idempotencyCommonComplete.execute(command);
  }

  public release(command: IIdempotencyCommonReleaseCommand): Promise<void> {
    return this.idempotencyCommonRelease.execute(command);
  }

  public purgeExpired(): Promise<IIdempotencyCommonPurgeExpiredView> {
    return this.idempotencyCommonPurgeExpired.execute();
  }
}
