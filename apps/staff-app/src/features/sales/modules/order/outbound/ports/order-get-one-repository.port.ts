import { Nullable } from '@acme-libs/toolkit';

import { IOrderFoundRecord } from '../interfaces';

export interface IOrderGetOneRepositoryPort {
  findById(orderId: string): Promise<Nullable<IOrderFoundRecord>>;
}

export const ORDER_GET_ONE_REPOSITORY_PORT = Symbol('ORDER_GET_ONE_REPOSITORY_PORT');
