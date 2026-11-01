export interface IProductStockIdempotencyReplayView<T> {
  outcome: 'replay';
  storedResponse: T;
}
