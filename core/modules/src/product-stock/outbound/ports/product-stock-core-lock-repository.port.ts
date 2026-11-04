import { IProductStockCoreLockProductRecord, IProductStockCoreLockSumRecord } from '../interfaces';

export interface IProductStockCoreLockRepositoryPort {
  lockProducts(productIds: string[]): Promise<IProductStockCoreLockProductRecord>;
  sumStock(productIds: string[]): Promise<IProductStockCoreLockSumRecord>;
}

export const PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT',
);
