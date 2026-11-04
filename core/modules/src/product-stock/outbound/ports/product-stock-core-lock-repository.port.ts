import { IProductStockCoreSumRecord } from '../interfaces';

export interface IProductStockCoreLockRepositoryPort {
  lockProducts(productIds: string[]): Promise<string[]>;
  sumStock(productIds: string[]): Promise<IProductStockCoreSumRecord[]>;
}

export const PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT',
);
