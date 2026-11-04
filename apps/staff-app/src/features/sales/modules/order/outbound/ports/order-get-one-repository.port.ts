import { Nullable } from '@acme-libs/toolkit';

import { IOrderGetOneRecord } from '../interfaces';

export interface IOrderGetOneRepositoryPort {
  findById(orderId: string): Promise<Nullable<IOrderGetOneRecord>>;
}

export const ORDER_GET_ONE_REPOSITORY_PORT = Symbol('ORDER_GET_ONE_REPOSITORY_PORT');
