export enum OrderIdempotencyOutcomeEnum {
  CLAIMED = 'claimed',
  IN_FLIGHT = 'in-flight',
  MISMATCH = 'mismatch',
  REPLAY = 'replay',
}
