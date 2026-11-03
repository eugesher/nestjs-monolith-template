import { Nullable } from '@acme-libs/toolkit';

import { IOrderRecord } from '../../domain';
import { IOrderFindOwnedQuery } from '../interfaces';

export interface IOrderGetOneRepositoryPort {
  findOwned(query: IOrderFindOwnedQuery): Promise<Nullable<IOrderRecord>>;
}

export const ORDER_GET_ONE_REPOSITORY_PORT = Symbol('ORDER_GET_ONE_REPOSITORY_PORT');
