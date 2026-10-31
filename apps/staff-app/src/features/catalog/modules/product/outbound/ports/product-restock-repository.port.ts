import { Nullable } from '@acme-libs/toolkit';
import { ProductModel } from '../../domain';

export interface IProductRestockRepositoryPort {
  findById(productId: string): Promise<Nullable<ProductModel>>;
}

export const PRODUCT_RESTOCK_REPOSITORY_PORT = Symbol('PRODUCT_RESTOCK_REPOSITORY_PORT');
