export interface IProductStockIdempotencyClaimCommand {
  key: string;
  body: object;
}

export interface IProductStockIdempotencyCompleteCommand {
  key: string;
  response: object;
}

export interface IProductStockIdempotencyReleaseCommand {
  key: string;
}
