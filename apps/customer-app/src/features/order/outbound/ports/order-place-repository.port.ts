import {
  IOrderPlaceInsertQuery,
  IOrderPlaceOrderProductInsertQuery,
  IOrderPlaceProductRecord,
  IOrderPlaceRecord,
} from '../interfaces';

export interface IOrderPlaceRepositoryPort {
  findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductRecord[]>;
  insertOrder(query: IOrderPlaceInsertQuery): Promise<string>;
  insertOrderProducts(queries: IOrderPlaceOrderProductInsertQuery[]): Promise<void>;
  findPlaced(orderId: string): Promise<IOrderPlaceRecord>;
}

export const ORDER_PLACE_REPOSITORY_PORT = Symbol('ORDER_PLACE_REPOSITORY_PORT');
