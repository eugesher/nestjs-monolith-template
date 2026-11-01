import {
  IProductStockIdempotencyClaimCommand,
  IProductStockIdempotencyCompleteCommand,
  IProductStockIdempotencyOutcomeView,
  IProductStockIdempotencyReleaseCommand,
  IProductStockIdempotencyReplayView,
} from '../interfaces';

export interface IProductStockIdempotencyPort {
  claim<T>(
    command: IProductStockIdempotencyClaimCommand,
  ): Promise<IProductStockIdempotencyOutcomeView | IProductStockIdempotencyReplayView<T>>;
  complete(command: IProductStockIdempotencyCompleteCommand): Promise<void>;
  release(command: IProductStockIdempotencyReleaseCommand): Promise<void>;
}

export const PRODUCT_STOCK_IDEMPOTENCY_PORT = Symbol('PRODUCT_STOCK_IDEMPOTENCY_PORT');
