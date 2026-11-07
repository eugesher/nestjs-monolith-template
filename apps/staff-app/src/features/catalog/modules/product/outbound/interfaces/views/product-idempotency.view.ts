import { ProductIdempotencyOutcomeEnum } from '../../enums/product-idempotency-outcome.enum';

export interface IProductIdempotencyOutcomeView {
  outcome: Exclude<ProductIdempotencyOutcomeEnum, ProductIdempotencyOutcomeEnum.REPLAY>;
}

export interface IProductIdempotencyReplayView<T> {
  outcome: ProductIdempotencyOutcomeEnum.REPLAY;
  storedResponse: T;
}
