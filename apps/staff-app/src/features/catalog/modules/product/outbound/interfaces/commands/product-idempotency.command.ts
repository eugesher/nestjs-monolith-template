export interface IProductIdempotencyClaimCommand {
  key: string;
  body: object;
}

export interface IProductIdempotencyCompleteCommand {
  key: string;
  response: object;
}

export interface IProductIdempotencyReleaseCommand {
  key: string;
}
