import { Nullable } from '@acme-libs/toolkit';

import { IProductStockProductFoundRecord } from '../interfaces';

export interface IProductStockAddRepositoryPort {
  findById(productId: string): Promise<Nullable<IProductStockProductFoundRecord>>;
}

export const PRODUCT_STOCK_ADD_REPOSITORY_PORT = Symbol('PRODUCT_STOCK_ADD_REPOSITORY_PORT');
