import { IOrderStock, OrderModel } from '../../domain';

export interface IOrderPlaceRepositoryPort {
  lockStock(productIds: string[]): Promise<IOrderStock[]>;
  insert(order: OrderModel): Promise<OrderModel>;
}

export const ORDER_PLACE_REPOSITORY_PORT = Symbol('ORDER_PLACE_REPOSITORY_PORT');
