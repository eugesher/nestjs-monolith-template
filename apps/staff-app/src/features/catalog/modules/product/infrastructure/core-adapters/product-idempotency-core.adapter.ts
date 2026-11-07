import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_PORT,
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCorePort,
} from '@acme-core/contracts/idempotency';

import {
  IProductIdempotencyClaimCommand,
  IProductIdempotencyCompleteCommand,
  IProductIdempotencyOutcomeView,
  IProductIdempotencyPort,
  IProductIdempotencyReleaseCommand,
  IProductIdempotencyReplayView,
  PRODUCT_IDEMPOTENCY_PORT,
  ProductIdempotencyOutcomeEnum,
} from '../../outbound';

@Injectable()
export class ProductIdempotencyCoreAdapter implements IProductIdempotencyPort {
  public static readonly provider: ClassProvider<IProductIdempotencyPort> = {
    provide: PRODUCT_IDEMPOTENCY_PORT,
    useClass: ProductIdempotencyCoreAdapter,
  };

  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCoreClaimOutcomeEnum, IdempotencyCoreClaimOutcomeEnum.REPLAY>,
    IProductIdempotencyOutcomeView['outcome']
  > = {
    [IdempotencyCoreClaimOutcomeEnum.CLAIMED]: ProductIdempotencyOutcomeEnum.CLAIMED,
    [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT]: ProductIdempotencyOutcomeEnum.IN_FLIGHT,
    [IdempotencyCoreClaimOutcomeEnum.MISMATCH]: ProductIdempotencyOutcomeEnum.MISMATCH,
  };

  constructor(
    @Inject(IDEMPOTENCY_CORE_PORT)
    private readonly idempotency: IIdempotencyCorePort,
  ) {}

  public async claim<T>(
    command: IProductIdempotencyClaimCommand,
  ): Promise<IProductIdempotencyOutcomeView | IProductIdempotencyReplayView<T>> {
    const { key, body } = command;
    const claim = await this.idempotency.handleClaim({ key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return { outcome: ProductIdempotencyOutcomeEnum.REPLAY, storedResponse: storedResponse as T };
    }

    return { outcome: ProductIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IProductIdempotencyCompleteCommand): Promise<void> {
    const { key, response } = command;

    await this.idempotency.handleComplete({ key, response });
  }

  public async release(command: IProductIdempotencyReleaseCommand): Promise<void> {
    const { key } = command;

    await this.idempotency.handleRelease({ key });
  }
}
