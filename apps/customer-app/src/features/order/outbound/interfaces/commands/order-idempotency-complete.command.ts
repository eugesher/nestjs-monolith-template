export interface IOrderIdempotencyCompleteCommand {
  key: string;
  response: object;
}
