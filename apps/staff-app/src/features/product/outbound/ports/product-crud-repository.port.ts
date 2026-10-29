import { IPage } from '@acme-libs/toolkit';
import { ProductModel } from '../../domain';
import { IProductPageQuery } from '../interfaces';

export interface IProductCrudRepositoryPort {
  list(query: IProductPageQuery): Promise<IPage<ProductModel>>;
}

export const PRODUCT_CRUD_REPOSITORY_PORT = Symbol('PRODUCT_CRUD_REPOSITORY_PORT');
