import {
  IOrderInsertCommand,
  IOrderPlacedRecord,
  IOrderPlaceProductView,
  IOrderProductInsertCommand,
} from '../interfaces';

export interface IOrderPlaceRepositoryPort {
  findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductView[]>;
  insertOrder(command: IOrderInsertCommand): Promise<string>;
  insertOrderProducts(commands: IOrderProductInsertCommand[]): Promise<void>;
  findOrder(orderId: string): Promise<IOrderPlacedRecord>;
}

export const ORDER_PLACE_REPOSITORY_PORT = Symbol('ORDER_PLACE_REPOSITORY_PORT');
