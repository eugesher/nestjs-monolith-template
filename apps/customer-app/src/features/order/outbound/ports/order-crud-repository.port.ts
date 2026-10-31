import { IPage, Nullable } from '@acme-libs/toolkit';
import { OrderModel } from '../../domain';
import { IOrderFindOwnedQuery, IOrderListedView, IOrderPageQuery } from '../interfaces';

export interface IOrderCrudRepositoryPort {
  list(query: IOrderPageQuery): Promise<IPage<IOrderListedView>>;
  findOwned(query: IOrderFindOwnedQuery): Promise<Nullable<OrderModel>>;
}

export const ORDER_CRUD_REPOSITORY_PORT = Symbol('ORDER_CRUD_REPOSITORY_PORT');
