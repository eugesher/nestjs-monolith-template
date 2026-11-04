import { IOrderGetManyRecord, IOrderGetManyQuery } from '../interfaces';

export interface IOrderGetManyRepositoryPort {
  list(query: IOrderGetManyQuery): Promise<IOrderGetManyRecord>;
}

export const ORDER_GET_MANY_REPOSITORY_PORT = Symbol('ORDER_GET_MANY_REPOSITORY_PORT');
