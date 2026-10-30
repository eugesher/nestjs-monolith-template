import { IPage, Nullable } from '@acme-libs/toolkit';
import { OrderModel } from '../../domain';
import { IOrderListedView, IOrderPageQuery } from '../interfaces';

export interface IOrderCrudRepositoryPort {
  list(query: IOrderPageQuery): Promise<IPage<IOrderListedView>>;
  findById(orderId: string): Promise<Nullable<OrderModel>>;
}

export const ORDER_CRUD_REPOSITORY_PORT = Symbol('ORDER_CRUD_REPOSITORY_PORT');
