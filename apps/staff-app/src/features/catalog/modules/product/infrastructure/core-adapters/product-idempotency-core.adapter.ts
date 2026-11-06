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
    [IdempotencyCoreClaimOutcomeEnum.CLAIMED]: 'claimed',
    [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT]: 'in-flight',
    [IdempotencyCoreClaimOutcomeEnum.MISMATCH]: 'mismatch',
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
      return { outcome: 'replay', storedResponse: storedResponse as T };
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
