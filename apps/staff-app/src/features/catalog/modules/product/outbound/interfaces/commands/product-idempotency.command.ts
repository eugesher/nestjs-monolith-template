export interface IProductIdempotencyClaimCommand {
  staffUserId: string;
  key: string;
  body: object;
}

export interface IProductIdempotencyCompleteCommand {
  staffUserId: string;
  key: string;
  response: object;
}

export interface IProductIdempotencyReleaseCommand {
  staffUserId: string;
  key: string;
}
