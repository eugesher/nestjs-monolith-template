import { Nullable } from '@acme-libs/toolkit';
import { ProductModel } from '../../domain';

export interface IProductAccessRepositoryPort {
  findById(productId: string): Promise<Nullable<ProductModel>>;
}

export const PRODUCT_ACCESS_REPOSITORY_PORT = Symbol('PRODUCT_ACCESS_REPOSITORY_PORT');
