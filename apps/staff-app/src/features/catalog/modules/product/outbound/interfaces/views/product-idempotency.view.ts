export interface IProductIdempotencyOutcomeView {
  outcome: 'claimed' | 'in-flight' | 'mismatch';
}

export interface IProductIdempotencyReplayView<T> {
  outcome: 'replay';
  storedResponse: T;
}
