export interface IProductIdempotencyReplayView<T> {
  outcome: 'replay';
  storedResponse: T;
}
