import { Product } from '@acme-core/entities';

type IProductStockArchiveOutOfStockProductRecordItem = Pick<Product, 'id'>;

export type IProductStockArchiveOutOfStockProductRecord =
  IProductStockArchiveOutOfStockProductRecordItem[];
