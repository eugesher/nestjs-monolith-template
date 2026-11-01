export interface IProductStockIdempotencyCompleteCommand {
  key: string;
  response: object;
}
