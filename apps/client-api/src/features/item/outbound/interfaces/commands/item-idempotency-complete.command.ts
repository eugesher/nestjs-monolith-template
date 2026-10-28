export interface IItemIdempotencyCompleteCommand {
  key: string;
  response: object;
}
