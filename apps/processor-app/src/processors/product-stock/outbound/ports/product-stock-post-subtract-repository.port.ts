import type { IProductStockPostSubtractProductRecord } from '../interfaces';

export interface IProductStockPostSubtractRepositoryPort {
  findActive(productIds: string[]): Promise<IProductStockPostSubtractProductRecord[]>;
}

export const PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT = Symbol(
  'PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT',
);
