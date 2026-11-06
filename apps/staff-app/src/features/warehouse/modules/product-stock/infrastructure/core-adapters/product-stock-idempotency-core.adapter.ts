import { Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_PORT,
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCorePort,
} from '@acme-core/contracts/idempotency';

import {
  IProductStockIdempotencyClaimCommand,
  IProductStockIdempotencyCompleteCommand,
  IProductStockIdempotencyOutcomeView,
  IProductStockIdempotencyPort,
  IProductStockIdempotencyReleaseCommand,
  IProductStockIdempotencyReplayView,
} from '../../outbound';

@Injectable()
export class ProductStockIdempotencyCoreAdapter implements IProductStockIdempotencyPort {
  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCoreClaimOutcomeEnum, IdempotencyCoreClaimOutcomeEnum.REPLAY>,
    IProductStockIdempotencyOutcomeView['outcome']
  > = {
    [IdempotencyCoreClaimOutcomeEnum.CLAIMED]: 'claimed',
    [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT]: 'in-flight',
    [IdempotencyCoreClaimOutcomeEnum.MISMATCH]: 'mismatch',
  };

  constructor(
    @Inject(IDEMPOTENCY_CORE_PORT)
    private readonly idempotency: IIdempotencyCorePort,
  ) {}

  public async claim<T>(
    command: IProductStockIdempotencyClaimCommand,
  ): Promise<IProductStockIdempotencyOutcomeView | IProductStockIdempotencyReplayView<T>> {
    const { key, body } = command;
    const claim = await this.idempotency.handleClaim({ key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return { outcome: 'replay', storedResponse: storedResponse as T };
    }

    return { outcome: ProductStockIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IProductStockIdempotencyCompleteCommand): Promise<void> {
    const { key, response } = command;

    await this.idempotency.handleComplete({ key, response });
  }

  public async release(command: IProductStockIdempotencyReleaseCommand): Promise<void> {
    const { key } = command;

    await this.idempotency.handleRelease({ key });
  }
}
