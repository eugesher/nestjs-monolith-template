export interface IProductStockMovementAddCommand {
  productId: string;
  quantity: number;
}

export interface IProductStockMovementLockCommand {
  productId: string;
}
