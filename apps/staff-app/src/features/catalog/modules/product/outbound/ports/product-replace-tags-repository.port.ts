import { Nullable } from '@acme-libs/toolkit';

import { IProductReplaceTagsRecord } from '../interfaces';

export interface IProductReplaceTagsRepositoryPort {
  lockById(productId: string): Promise<Nullable<IProductReplaceTagsRecord>>;
}

export const PRODUCT_REPLACE_TAGS_REPOSITORY_PORT = Symbol('PRODUCT_REPLACE_TAGS_REPOSITORY_PORT');
