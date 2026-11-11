import type { Nullable } from '@acme-libs/toolkit';

import type { IProductWriteRecord, IProductWriteUpdateQuery } from '../interfaces';

export interface IProductWriteRepositoryPort {
  findById(productId: string): Promise<Nullable<IProductWriteRecord>>;
  update(query: IProductWriteUpdateQuery): Promise<boolean>;
}

export const PRODUCT_WRITE_REPOSITORY_PORT = Symbol('PRODUCT_WRITE_REPOSITORY_PORT');
