export interface IProductStockIdempotencyOutcomeView {
  outcome: 'claimed' | 'in-flight' | 'mismatch';
}

export interface IProductStockIdempotencyReplayView<T> {
  outcome: 'replay';
  storedResponse: T;
}
