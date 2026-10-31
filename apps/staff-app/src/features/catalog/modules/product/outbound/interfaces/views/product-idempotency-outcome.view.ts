export interface IProductIdempotencyOutcomeView {
  outcome: 'claimed' | 'in-flight' | 'mismatch';
}
