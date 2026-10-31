import { IPage, Nullable } from '@acme-libs/toolkit';
import { IOrderFoundView, IOrderListedView, IOrderPageQuery } from '../interfaces';

export interface IOrderCrudRepositoryPort {
  list(query: IOrderPageQuery): Promise<IPage<IOrderListedView>>;
  findById(orderId: string): Promise<Nullable<IOrderFoundView>>;
}

export const ORDER_CRUD_REPOSITORY_PORT = Symbol('ORDER_CRUD_REPOSITORY_PORT');
