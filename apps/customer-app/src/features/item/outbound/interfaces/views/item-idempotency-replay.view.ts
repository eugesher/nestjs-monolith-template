export interface IItemIdempotencyReplayView<T> {
  outcome: 'replay';
  storedResponse: T;
}
