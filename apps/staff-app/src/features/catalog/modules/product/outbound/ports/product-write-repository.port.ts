import { Nullable } from '@acme-libs/toolkit';

import { IProductFoundRecord, IProductWriteUpdateQuery } from '../interfaces';

export interface IProductWriteRepositoryPort {
  findById(productId: string): Promise<Nullable<IProductFoundRecord>>;
  update(query: IProductWriteUpdateQuery): Promise<boolean>;
}

export const PRODUCT_WRITE_REPOSITORY_PORT = Symbol('PRODUCT_WRITE_REPOSITORY_PORT');
