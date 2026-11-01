export interface IProductStockAddCommand {
  productId: string;
  quantity: number;
  idempotencyKey: string;
}
