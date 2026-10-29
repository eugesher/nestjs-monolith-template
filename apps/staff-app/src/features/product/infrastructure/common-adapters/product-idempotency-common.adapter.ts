import { Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_COMMON_PORT,
  IdempotencyCommonClaimOutcomeEnum,
  type IIdempotencyCommonPort,
} from '@acme-staff-contracts/idempotency';
import {
  IProductIdempotencyClaimCommand,
  IProductIdempotencyCompleteCommand,
  IProductIdempotencyOutcomeView,
  IProductIdempotencyPort,
  IProductIdempotencyReleaseCommand,
  IProductIdempotencyReplayView,
} from '../../outbound';

@Injectable()
export class ProductIdempotencyCommonAdapter implements IProductIdempotencyPort {
  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCommonClaimOutcomeEnum, IdempotencyCommonClaimOutcomeEnum.REPLAY>,
    IProductIdempotencyOutcomeView['outcome']
  > = {
    [IdempotencyCommonClaimOutcomeEnum.CLAIMED]: 'claimed',
    [IdempotencyCommonClaimOutcomeEnum.IN_FLIGHT]: 'in-flight',
    [IdempotencyCommonClaimOutcomeEnum.MISMATCH]: 'mismatch',
  };

  constructor(
    @Inject(IDEMPOTENCY_COMMON_PORT)
    private readonly idempotency: IIdempotencyCommonPort,
  ) {}

  public async claim<T>(
    command: IProductIdempotencyClaimCommand,
  ): Promise<IProductIdempotencyOutcomeView | IProductIdempotencyReplayView<T>> {
    const { key, body } = command;
    const claim = await this.idempotency.claim({ key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCommonClaimOutcomeEnum.REPLAY) {
      return { outcome: 'replay', storedResponse: storedResponse as T };
    }

    return { outcome: ProductIdempotencyCommonAdapter.OUTCOMES[outcome] };
  }

  public complete(command: IProductIdempotencyCompleteCommand): Promise<void> {
    const { key, response } = command;

    return this.idempotency.complete({ key, response });
  }

  public release(command: IProductIdempotencyReleaseCommand): Promise<void> {
    const { key } = command;

    return this.idempotency.release({ key });
  }
}
