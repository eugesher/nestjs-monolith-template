export interface IOrderIdempotencyReplayView<T> {
  outcome: 'replay';
  storedResponse: T;
}
