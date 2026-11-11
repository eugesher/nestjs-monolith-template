import type { Product } from '@acme-core/entities';

export type IProductStockCoreLockProductRecord = Pick<Product, 'id'>;

export interface IProductStockCoreLockSumRecord {
  productId: string;
  quantity: number | string;
}
