export interface IProductStockIdempotencyOutcomeView {
  outcome: 'claimed' | 'in-flight' | 'mismatch';
}
