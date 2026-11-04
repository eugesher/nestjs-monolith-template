import { Product } from '@acme-core/entities';

type IProductStockCoreLockProductRecordItem = Pick<Product, 'id'>;

export type IProductStockCoreLockProductRecord = IProductStockCoreLockProductRecordItem[];

export interface IProductStockCoreLockSumRecordItem {
  productId: string;
  quantity: number | string;
}

export type IProductStockCoreLockSumRecord = IProductStockCoreLockSumRecordItem[];
