import type { Nullable } from '@acme-libs/toolkit';

import type { IOrderReplaceTagsRecord } from '../interfaces';

export interface IOrderReplaceTagsRepositoryPort {
  lockById(orderId: string): Promise<Nullable<IOrderReplaceTagsRecord>>;
}

export const ORDER_REPLACE_TAGS_REPOSITORY_PORT = Symbol('ORDER_REPLACE_TAGS_REPOSITORY_PORT');
