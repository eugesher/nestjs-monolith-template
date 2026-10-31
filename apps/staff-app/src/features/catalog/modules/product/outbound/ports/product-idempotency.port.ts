import {
  IProductIdempotencyClaimCommand,
  IProductIdempotencyCompleteCommand,
  IProductIdempotencyOutcomeView,
  IProductIdempotencyReleaseCommand,
  IProductIdempotencyReplayView,
} from '../interfaces';

export interface IProductIdempotencyPort {
  claim<T>(
    command: IProductIdempotencyClaimCommand,
  ): Promise<IProductIdempotencyOutcomeView | IProductIdempotencyReplayView<T>>;
  complete(command: IProductIdempotencyCompleteCommand): Promise<void>;
  release(command: IProductIdempotencyReleaseCommand): Promise<void>;
}

export const PRODUCT_IDEMPOTENCY_PORT = Symbol('PRODUCT_IDEMPOTENCY_PORT');
