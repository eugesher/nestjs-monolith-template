export interface IOrderIdempotencyOutcomeView {
  outcome: 'claimed' | 'in-flight' | 'mismatch';
}
