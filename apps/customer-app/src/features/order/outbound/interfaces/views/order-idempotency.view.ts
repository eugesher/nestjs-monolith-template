export interface IOrderIdempotencyOutcomeView {
  outcome: 'claimed' | 'in-flight' | 'mismatch';
}

export interface IOrderIdempotencyReplayView<T> {
  outcome: 'replay';
  storedResponse: T;
}
