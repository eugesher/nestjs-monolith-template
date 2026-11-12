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
  private static readonly SCOPE_PREFIX = 'customer';

  constructor(
    @Inject(IDEMPOTENCY_CORE_PORT)
    private readonly idempotency: IIdempotencyCorePort,
  ) {}

  public async claim<T>(
    command: IOrderIdempotencyClaimCommand,
  ): Promise<IOrderIdempotencyOutcomeView | IOrderIdempotencyReplayView<T>> {
    const { customerId, key, body } = command;
    const scope = OrderIdempotencyCoreAdapter.toScope(customerId);
    const claim = await this.idempotency.handleClaim({ scope, key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return { outcome: OrderIdempotencyOutcomeEnum.REPLAY, storedResponse: storedResponse as T };
    }

    return { outcome: OrderIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IOrderIdempotencyCompleteCommand): Promise<void> {
    const { customerId, key, response } = command;
    const scope = OrderIdempotencyCoreAdapter.toScope(customerId);

    await this.idempotency.handleComplete({ scope, key, response });
  }

  public async release(command: IOrderIdempotencyReleaseCommand): Promise<void> {
    const { customerId, key } = command;
    const scope = OrderIdempotencyCoreAdapter.toScope(customerId);

    await this.idempotency.handleRelease({ scope, key });
  }

  private static toScope(customerId: string): string {
    return `${OrderIdempotencyCoreAdapter.SCOPE_PREFIX}:${customerId}`;
  }
}
