import { IPage } from '@acme-libs/toolkit';

import { IOrderListedRecord, IOrderPageQuery } from '../interfaces';

export interface IOrderGetManyRepositoryPort {
  list(query: IOrderPageQuery): Promise<IPage<IOrderListedRecord>>;
}

export const ORDER_GET_MANY_REPOSITORY_PORT = Symbol('ORDER_GET_MANY_REPOSITORY_PORT');
