import { IOrderListedRecord, IOrderPageQuery } from '../interfaces';

export interface IOrderGetManyRepositoryPort {
  list(query: IOrderPageQuery): Promise<[IOrderListedRecord[], number]>;
}

export const ORDER_GET_MANY_REPOSITORY_PORT = Symbol('ORDER_GET_MANY_REPOSITORY_PORT');
