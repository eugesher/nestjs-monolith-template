export interface IProductCreateCommand {
  sku: string;
  name: string;
  idempotencyKey: string;
}
