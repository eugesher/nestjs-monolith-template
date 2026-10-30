import { Nullable } from '@acme-libs/toolkit';

export interface IProductStockCoreMovementInsertCommand {
  productId: string;
  quantity: number;
  orderProductId: Nullable<string>;
}
