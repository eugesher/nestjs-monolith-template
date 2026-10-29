export interface IItemIdempotencyOutcomeView {
  outcome: 'claimed' | 'in-flight' | 'mismatch';
}
