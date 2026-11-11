import type { Nullable } from '@acme-libs/toolkit';

import type { IProductAccessRecord } from '../interfaces';

export interface IProductAccessRepositoryPort {
  findById(productId: string): Promise<Nullable<IProductAccessRecord>>;
}

export const PRODUCT_ACCESS_REPOSITORY_PORT = Symbol('PRODUCT_ACCESS_REPOSITORY_PORT');
