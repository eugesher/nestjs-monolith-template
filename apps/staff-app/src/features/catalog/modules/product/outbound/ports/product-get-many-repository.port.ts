import { IPage } from '@acme-libs/toolkit';

import { ProductModel } from '../../domain';
import { IProductPageQuery } from '../interfaces';

export interface IProductGetManyRepositoryPort {
  list(query: IProductPageQuery): Promise<IPage<ProductModel>>;
}

export const PRODUCT_GET_MANY_REPOSITORY_PORT = Symbol('PRODUCT_GET_MANY_REPOSITORY_PORT');
