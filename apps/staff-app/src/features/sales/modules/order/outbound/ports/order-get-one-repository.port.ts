import { Nullable } from '@acme-libs/toolkit';

import { IOrderFoundView } from '../interfaces';

export interface IOrderGetOneRepositoryPort {
  findById(orderId: string): Promise<Nullable<IOrderFoundView>>;
}

export const ORDER_GET_ONE_REPOSITORY_PORT = Symbol('ORDER_GET_ONE_REPOSITORY_PORT');
