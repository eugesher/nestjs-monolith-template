import { Nullable } from '@acme-libs/toolkit';

import { IOrderGetTagsRecord } from '../interfaces';

export interface IOrderGetTagsRepositoryPort {
  findExisting(orderId: string): Promise<Nullable<IOrderGetTagsRecord>>;
}

export const ORDER_GET_TAGS_REPOSITORY_PORT = Symbol('ORDER_GET_TAGS_REPOSITORY_PORT');
