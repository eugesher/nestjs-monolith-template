export interface IProductRestockCommand {
  productId: string;
  quantity: number;
  idempotencyKey: string;
}
