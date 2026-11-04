import { Nullable } from '@acme-libs/toolkit';

import { IOrderGetOneFindOwnedQuery, IOrderGetOneRecord } from '../interfaces';

export interface IOrderGetOneRepositoryPort {
  findOwned(query: IOrderGetOneFindOwnedQuery): Promise<Nullable<IOrderGetOneRecord>>;
}

export const ORDER_GET_ONE_REPOSITORY_PORT = Symbol('ORDER_GET_ONE_REPOSITORY_PORT');
