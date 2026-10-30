export interface IOrderPlaceCommand {
  customerId: string;
  productIds: string[];
  idempotencyKey: string;
}
