import {
  IOrderInsertQuery,
  IOrderPlacedRecord,
  IOrderPlaceProductRecord,
  IOrderProductInsertQuery,
} from '../interfaces';

export interface IOrderPlaceRepositoryPort {
  findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductRecord[]>;
  insertOrder(query: IOrderInsertQuery): Promise<string>;
  insertOrderProducts(queries: IOrderProductInsertQuery[]): Promise<void>;
  findOrder(orderId: string): Promise<IOrderPlacedRecord>;
}

export const ORDER_PLACE_REPOSITORY_PORT = Symbol('ORDER_PLACE_REPOSITORY_PORT');
