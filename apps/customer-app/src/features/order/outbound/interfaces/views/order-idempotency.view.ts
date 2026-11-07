import { OrderIdempotencyOutcomeEnum } from '../../enums/order-idempotency-outcome.enum';

export interface IOrderIdempotencyOutcomeView {
  outcome: Exclude<OrderIdempotencyOutcomeEnum, OrderIdempotencyOutcomeEnum.REPLAY>;
}

export interface IOrderIdempotencyReplayView<T> {
  outcome: OrderIdempotencyOutcomeEnum.REPLAY;
  storedResponse: T;
}
