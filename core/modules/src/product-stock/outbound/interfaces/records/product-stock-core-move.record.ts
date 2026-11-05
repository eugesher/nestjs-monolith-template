import { Product } from '@acme-core/entities';

export type IProductStockCoreMoveProductRecord = Pick<Product, 'id'>;

export interface IProductStockCoreMoveInsertRecord {
  id: number | string;
}

export interface IProductStockCoreMoveSumRecord {
  productId: string;
  quantity: number | string;
}
