import { ProductStock } from '@acme-core/entities';

export type IProductStockCoreMoveInsertQuery = Pick<
  ProductStock,
  'productId' | 'quantity' | 'orderProductId'
>;
