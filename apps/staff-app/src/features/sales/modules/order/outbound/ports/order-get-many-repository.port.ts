import { IOrderGetManyRecord, IOrderGetManyListQuery } from '../interfaces';

export interface IOrderGetManyRepositoryPort {
  list(query: IOrderGetManyListQuery): Promise<IOrderGetManyRecord>;
}

export const ORDER_GET_MANY_REPOSITORY_PORT = Symbol('ORDER_GET_MANY_REPOSITORY_PORT');
