import type { Nullable } from '@acme-libs/toolkit';

import type { IProductStockAddProductRecord } from '../interfaces';

export interface IProductStockAddRepositoryPort {
  findById(productId: string): Promise<Nullable<IProductStockAddProductRecord>>;
}

export const PRODUCT_STOCK_ADD_REPOSITORY_PORT = Symbol('PRODUCT_STOCK_ADD_REPOSITORY_PORT');
