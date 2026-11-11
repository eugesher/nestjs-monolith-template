import type { Nullable } from '@acme-libs/toolkit';

import type { IProductCoreArchiveRecord, IProductCoreArchiveUpdateQuery } from '../interfaces';

export interface IProductCoreArchiveRepositoryPort {
  lockById(productId: string): Promise<Nullable<IProductCoreArchiveRecord>>;
  update(query: IProductCoreArchiveUpdateQuery): Promise<void>;
}

export const PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT = Symbol('PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT');
