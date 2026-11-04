import { Nullable } from '@acme-libs/toolkit';

import { IProductCoreLockedRecord, IProductCoreWriteUpdateQuery } from '../interfaces';

export interface IProductCoreArchiveRepositoryPort {
  lockById(productId: string): Promise<Nullable<IProductCoreLockedRecord>>;
  update(query: IProductCoreWriteUpdateQuery): Promise<void>;
}

export const PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT = Symbol('PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT');
