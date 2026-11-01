import { Nullable } from '@acme-libs/toolkit';
import { ProductStockModel } from '../../domain';

export interface IProductStockAddRepositoryPort {
  findById(productId: string): Promise<Nullable<ProductStockModel>>;
}

export const PRODUCT_STOCK_ADD_REPOSITORY_PORT = Symbol('PRODUCT_STOCK_ADD_REPOSITORY_PORT');
