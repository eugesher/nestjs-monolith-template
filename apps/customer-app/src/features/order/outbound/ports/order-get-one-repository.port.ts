import { Nullable } from '@acme-libs/toolkit';

import { IOrderFindOwnedQuery, IOrderFoundRecord } from '../interfaces';

export interface IOrderGetOneRepositoryPort {
  findOwned(query: IOrderFindOwnedQuery): Promise<Nullable<IOrderFoundRecord>>;
}

export const ORDER_GET_ONE_REPOSITORY_PORT = Symbol('ORDER_GET_ONE_REPOSITORY_PORT');
