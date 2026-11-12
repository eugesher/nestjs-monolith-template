export interface IProductStockIdempotencyClaimCommand {
  staffUserId: string;
  key: string;
  body: object;
}

export interface IProductStockIdempotencyCompleteCommand {
  staffUserId: string;
  key: string;
  response: object;
}

export interface IProductStockIdempotencyReleaseCommand {
  staffUserId: string;
  key: string;
}
