export interface IProductCreateCommand {
  sku: string;
  name: string;
  staffUserId: string;
  idempotencyKey: string;
}
