export enum ProductStockIdempotencyOutcomeEnum {
  CLAIMED = 'claimed',
  IN_FLIGHT = 'in-flight',
  MISMATCH = 'mismatch',
  REPLAY = 'replay',
}
