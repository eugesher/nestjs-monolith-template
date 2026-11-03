import { Nullable } from '@acme-libs/toolkit';

import { IProductFoundRecord } from '../interfaces';

export interface IProductAccessRepositoryPort {
  findById(productId: string): Promise<Nullable<IProductFoundRecord>>;
}

export const PRODUCT_ACCESS_REPOSITORY_PORT = Symbol('PRODUCT_ACCESS_REPOSITORY_PORT');
