import { Product } from '@acme-core/entities';

type IProductStockCoreMoveProductRecordItem = Pick<Product, 'id'>;

export type IProductStockCoreMoveProductRecord = IProductStockCoreMoveProductRecordItem[];

interface IProductStockCoreMoveInsertRecordItem {
  id: number | string;
}

export type IProductStockCoreMoveInsertRecord = IProductStockCoreMoveInsertRecordItem[];

interface IProductStockCoreMoveSumRecordItem {
  productId: string;
  quantity: number | string;
}

export type IProductStockCoreMoveSumRecord = IProductStockCoreMoveSumRecordItem[];
