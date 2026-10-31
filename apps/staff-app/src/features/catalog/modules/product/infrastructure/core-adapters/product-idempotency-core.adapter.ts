import { Inject, Injectable } from '@nestjs/common';

import {
  IDEMPOTENCY_CORE_KEY_PORT,
  IdempotencyCoreClaimOutcomeEnum,
  type IIdempotencyCoreKeyPort,
} from '@acme-core/contracts/idempotency';
import {
  IProductIdempotencyClaimCommand,
  IProductIdempotencyCompleteCommand,
  IProductIdempotencyOutcomeView,
  IProductIdempotencyPort,
  IProductIdempotencyReleaseCommand,
  IProductIdempotencyReplayView,
} from '../../outbound';

@Injectable()
export class ProductIdempotencyCoreAdapter implements IProductIdempotencyPort {
  private static readonly OUTCOMES: Record<
    Exclude<IdempotencyCoreClaimOutcomeEnum, IdempotencyCoreClaimOutcomeEnum.REPLAY>,
    IProductIdempotencyOutcomeView['outcome']
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
    command: IProductIdempotencyClaimCommand,
  ): Promise<IProductIdempotencyOutcomeView | IProductIdempotencyReplayView<T>> {
    const { key, body } = command;
    const claim = await this.idempotency.claim({ key, body });
    const { outcome, storedResponse } = claim;

    if (outcome === IdempotencyCoreClaimOutcomeEnum.REPLAY) {
      return { outcome: 'replay', storedResponse: storedResponse as T };
    }

    return { outcome: ProductIdempotencyCoreAdapter.OUTCOMES[outcome] };
  }

  public async complete(command: IProductIdempotencyCompleteCommand): Promise<void> {
    const { key, response } = command;

    await this.idempotency.complete({ key, response });
  }

  public async release(command: IProductIdempotencyReleaseCommand): Promise<void> {
    const { key } = command;

    await this.idempotency.release({ key });
  }
}
