export interface IProductStockAddCommand {
  productId: string;
  quantity: number;
  staffUserId: string;
  idempotencyKey: string;
}
