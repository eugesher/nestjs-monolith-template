import { Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_COMMON_PORT,
  IdempotencyCommonClaimOutcomeEnum,
  type IIdempotencyCommonPort,
} from '@acme-client-contracts/idempotency';
import {
  IItemIdempotencyClaimCommand,
  IItemIdempotencyCompleteCommand,
  IItemIdempotencyOutcomeView,
  IItemIdempotencyPort,
  IItemIdempotencyReleaseCommand,
  IItemIdempotencyReplayView,
} from '../../outbound';

@Injectable()
export class ItemIdempotencyCommonAdapter implements IItemIdempotencyPort {
  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCommonClaimOutcomeEnum, IdempotencyCommonClaimOutcomeEnum.REPLAY>,
    IItemIdempotencyOutcomeView['outcome']
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
    command: IItemIdempotencyClaimCommand,
  ): Promise<IItemIdempotencyOutcomeView | IItemIdempotencyReplayView<T>> {
    const { key, body } = command;
    const claim = await this.idempotency.claim({ key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCommonClaimOutcomeEnum.REPLAY) {
      return { outcome: 'replay', storedResponse: storedResponse as T };
    }

    return { outcome: ItemIdempotencyCommonAdapter.OUTCOMES[outcome] };
  }

  public complete(command: IItemIdempotencyCompleteCommand): Promise<void> {
    const { key, response } = command;

    return this.idempotency.complete({ key, response });
  }

  public release(command: IItemIdempotencyReleaseCommand): Promise<void> {
    const { key } = command;

    return this.idempotency.release({ key });
  }
}
