export interface IOrderIdempotencyClaimCommand {
  customerId: string;
  key: string;
  body: object;
}

export interface IOrderIdempotencyCompleteCommand {
  customerId: string;
  key: string;
  response: object;
}

export interface IOrderIdempotencyReleaseCommand {
  customerId: string;
  key: string;
}
