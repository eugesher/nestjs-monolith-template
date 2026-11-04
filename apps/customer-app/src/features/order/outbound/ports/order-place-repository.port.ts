import {
  IOrderPlaceOrderInsertQuery,
  IOrderPlaceOrderRecord,
  IOrderPlaceProductRecord,
  IOrderPlaceOrderProductInsertQuery,
} from '../interfaces';

export interface IOrderPlaceRepositoryPort {
  findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductRecord[]>;
  insertOrder(query: IOrderPlaceOrderInsertQuery): Promise<string>;
  insertOrderProducts(queries: IOrderPlaceOrderProductInsertQuery[]): Promise<void>;
  findOrder(orderId: string): Promise<IOrderPlaceOrderRecord>;
}

export const ORDER_PLACE_REPOSITORY_PORT = Symbol('ORDER_PLACE_REPOSITORY_PORT');
