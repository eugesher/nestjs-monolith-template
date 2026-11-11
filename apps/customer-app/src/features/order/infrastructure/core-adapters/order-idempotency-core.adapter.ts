import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_PORT,
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCorePort,
} from '@acme-core/contracts/idempotency';

import {
  ORDER_IDEMPOTENCY_PORT,
  OrderIdempotencyOutcomeEnum,
  type IOrderIdempotencyClaimCommand,
  type IOrderIdempotencyCompleteCommand,
  type IOrderIdempotencyOutcomeView,
  type IOrderIdempotencyPort,
  type IOrderIdempotencyReleaseCommand,
  type IOrderIdempotencyReplayView,
} from '../../outbound';

@Injectable()
export class OrderIdempotencyCoreAdapter implements IOrderIdempotencyPort {
  public static readonly provider: ClassProvider<IOrderIdempotencyPort> = {
    provide: ORDER_IDEMPOTENCY_PORT,
    useClass: OrderIdempotencyCoreAdapter,
  };

  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCoreClaimOutcomeEnum, IdempotencyCoreClaimOutcomeEnum.REPLAY>,
    IOrderIdempotencyOutcomeView['outcome']
  > = {
    [IdempotencyCoreClaimOutcomeEnum.CLAIMED]: OrderIdempotencyOutcomeEnum.CLAIMED,
    [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT]: OrderIdempotencyOutcomeEnum.IN_FLIGHT,
    [IdempotencyCoreClaimOutcomeEnum.MISMATCH]: OrderIdempotencyOutcomeEnum.MISMATCH,
  };

  constructor(
    @Inject(IDEMPOTENCY_CORE_PORT)
    private readonly idempotency: IIdempotencyCorePort,
  ) {}

  public async claim<T>(
    command: IOrderIdempotencyClaimCommand,
  ): Promise<IOrderIdempotencyOutcomeView | IOrderIdempotencyReplayView<T>> {
    const { key, body } = command;
    const claim = await this.idempotency.handleClaim({ key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return { outcome: OrderIdempotencyOutcomeEnum.REPLAY, storedResponse: storedResponse as T };
    }

    return { outcome: OrderIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IOrderIdempotencyCompleteCommand): Promise<void> {
    const { key, response } = command;

    await this.idempotency.handleComplete({ key, response });
  }

  public async release(command: IOrderIdempotencyReleaseCommand): Promise<void> {
    const { key } = command;

    await this.idempotency.handleRelease({ key });
  }
}
