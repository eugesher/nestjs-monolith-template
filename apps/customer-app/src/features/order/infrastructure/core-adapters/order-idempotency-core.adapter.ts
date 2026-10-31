import { Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_KEY_PORT,
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCoreKeyPort,
} from '@acme-core/contracts/idempotency';
import {
  IOrderIdempotencyClaimCommand,
  IOrderIdempotencyCompleteCommand,
  IOrderIdempotencyOutcomeView,
  IOrderIdempotencyPort,
  IOrderIdempotencyReleaseCommand,
  IOrderIdempotencyReplayView,
} from '../../outbound';

@Injectable()
export class OrderIdempotencyCoreAdapter implements IOrderIdempotencyPort {
  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCoreClaimOutcomeEnum, IdempotencyCoreClaimOutcomeEnum.REPLAY>,
    IOrderIdempotencyOutcomeView['outcome']
  > = {
    [IdempotencyCoreClaimOutcomeEnum.CLAIMED]: 'claimed',
    [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT]: 'in-flight',
    [IdempotencyCoreClaimOutcomeEnum.MISMATCH]: 'mismatch',
  };

  constructor(
    @Inject(IDEMPOTENCY_CORE_KEY_PORT)
    private readonly idempotency: IIdempotencyCoreKeyPort,
  ) {}

  public async claim<T>(
    command: IOrderIdempotencyClaimCommand,
  ): Promise<IOrderIdempotencyOutcomeView | IOrderIdempotencyReplayView<T>> {
    const { key, body } = command;
    const claim = await this.idempotency.claim({ key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return { outcome: 'replay', storedResponse: storedResponse as T };
    }

    return { outcome: OrderIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IOrderIdempotencyCompleteCommand): Promise<void> {
    const { key, response } = command;

    await this.idempotency.complete({ key, response });
  }

  public async release(command: IOrderIdempotencyReleaseCommand): Promise<void> {
    const { key } = command;

    await this.idempotency.release({ key });
  }
}
