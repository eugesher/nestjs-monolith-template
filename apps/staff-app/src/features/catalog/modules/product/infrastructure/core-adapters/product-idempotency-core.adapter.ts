import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_PORT,
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCorePort,
} from '@acme-core/contracts/idempotency';

import {
  PRODUCT_IDEMPOTENCY_PORT,
  ProductIdempotencyOutcomeEnum,
  type IProductIdempotencyClaimCommand,
  type IProductIdempotencyCompleteCommand,
  type IProductIdempotencyOutcomeView,
  type IProductIdempotencyPort,
  type IProductIdempotencyReleaseCommand,
  type IProductIdempotencyReplayView,
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
  private static readonly SCOPE_PREFIX = 'staff';

  constructor(
    @Inject(IDEMPOTENCY_CORE_PORT)
    private readonly idempotency: IIdempotencyCorePort,
  ) {}

  public async claim<T>(
    command: IProductIdempotencyClaimCommand,
  ): Promise<IProductIdempotencyOutcomeView | IProductIdempotencyReplayView<T>> {
    const { staffUserId, key, body } = command;
    const scope = ProductIdempotencyCoreAdapter.toScope(staffUserId);
    const claim = await this.idempotency.handleClaim({ scope, key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return { outcome: ProductIdempotencyOutcomeEnum.REPLAY, storedResponse: storedResponse as T };
    }

    return { outcome: ProductIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IProductIdempotencyCompleteCommand): Promise<void> {
    const { staffUserId, key, response } = command;
    const scope = ProductIdempotencyCoreAdapter.toScope(staffUserId);

    await this.idempotency.handleComplete({ scope, key, response });
  }

  public async release(command: IProductIdempotencyReleaseCommand): Promise<void> {
    const { staffUserId, key } = command;
    const scope = ProductIdempotencyCoreAdapter.toScope(staffUserId);

    await this.idempotency.handleRelease({ scope, key });
  }

  private static toScope(staffUserId: string): string {
    return `${ProductIdempotencyCoreAdapter.SCOPE_PREFIX}:${staffUserId}`;
  }
}
