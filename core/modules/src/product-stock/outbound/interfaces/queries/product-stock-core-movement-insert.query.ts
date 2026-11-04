import { Nullable } from '@acme-libs/toolkit';

export interface IProductStockCoreMovementInsertQuery {
  productId: string;
  quantity: number;
  orderProductId: Nullable<string>;
}
