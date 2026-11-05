export interface IOrderIdempotencyClaimCommand {
  key: string;
  body: object;
}

export interface IOrderIdempotencyCompleteCommand {
  key: string;
  response: object;
}

export interface IOrderIdempotencyReleaseCommand {
  key: string;
}
