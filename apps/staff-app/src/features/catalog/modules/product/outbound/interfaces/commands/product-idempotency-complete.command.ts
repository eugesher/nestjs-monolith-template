export interface IProductIdempotencyCompleteCommand {
  key: string;
  response: object;
}
