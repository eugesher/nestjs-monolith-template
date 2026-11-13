import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_PORT,
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCorePort,
} from '@acme-core/contracts/idempotency';

import {
  PRODUCT_STOCK_IDEMPOTENCY_PORT,
  ProductStockIdempotencyOutcomeEnum,
  type IProductStockIdempotencyClaimCommand,
  type IProductStockIdempotencyCompleteCommand,
  type IProductStockIdempotencyOutcomeView,
  type IProductStockIdempotencyPort,
  type IProductStockIdempotencyReleaseCommand,
  type IProductStockIdempotencyReplayView,
} from '../../outbound';

@Injectable()
export class ProductStockIdempotencyCoreAdapter implements IProductStockIdempotencyPort {
  public static readonly provider: ClassProvider<IProductStockIdempotencyPort> = {
    provide: PRODUCT_STOCK_IDEMPOTENCY_PORT,
    useClass: ProductStockIdempotencyCoreAdapter,
  };

  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCoreClaimOutcomeEnum, IdempotencyCoreClaimOutcomeEnum.REPLAY>,
    IProductStockIdempotencyOutcomeView['outcome']
  > = {
    [IdempotencyCoreClaimOutcomeEnum.CLAIMED]: ProductStockIdempotencyOutcomeEnum.CLAIMED,
    [IdempotencyCoreClaimOutcomeEnum.IN_FLIGHT]: ProductStockIdempotencyOutcomeEnum.IN_FLIGHT,
    [IdempotencyCoreClaimOutcomeEnum.MISMATCH]: ProductStockIdempotencyOutcomeEnum.MISMATCH,
  };
  private static readonly SCOPE_PREFIX = 'staff';

  constructor(
    @Inject(IDEMPOTENCY_CORE_PORT)
    private readonly idempotency: IIdempotencyCorePort,
  ) {}

  public async claim<T>(
    command: IProductStockIdempotencyClaimCommand,
  ): Promise<IProductStockIdempotencyOutcomeView | IProductStockIdempotencyReplayView<T>> {
    const { staffUserId, key, body } = command;
    const scope = ProductStockIdempotencyCoreAdapter.toScope(staffUserId);
    const coreClaim = await this.idempotency.handleClaim({ scope, key, body });
    const { outcome, storedResponse } = coreClaim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return {
        outcome: ProductStockIdempotencyOutcomeEnum.REPLAY,
        storedResponse: storedResponse as T,
      };
    }

    return { outcome: ProductStockIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IProductStockIdempotencyCompleteCommand): Promise<void> {
    const { staffUserId, key, response } = command;
    const scope = ProductStockIdempotencyCoreAdapter.toScope(staffUserId);

    await this.idempotency.handleComplete({ scope, key, response });
  }

  public async release(command: IProductStockIdempotencyReleaseCommand): Promise<void> {
    const { staffUserId, key } = command;
    const scope = ProductStockIdempotencyCoreAdapter.toScope(staffUserId);

    await this.idempotency.handleRelease({ scope, key });
  }

  private static toScope(staffUserId: string): string {
    return `${ProductStockIdempotencyCoreAdapter.SCOPE_PREFIX}:${staffUserId}`;
  }
}
