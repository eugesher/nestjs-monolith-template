import type { ProductStockIdempotencyOutcomeEnum } from '../../enums/product-stock-idempotency-outcome.enum';

export interface IProductStockIdempotencyOutcomeView {
  outcome: Exclude<ProductStockIdempotencyOutcomeEnum, ProductStockIdempotencyOutcomeEnum.REPLAY>;
}

export interface IProductStockIdempotencyReplayView<T> {
  outcome: ProductStockIdempotencyOutcomeEnum.REPLAY;
  storedResponse: T;
}
