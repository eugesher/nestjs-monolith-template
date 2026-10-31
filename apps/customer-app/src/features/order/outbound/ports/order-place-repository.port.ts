import { OrderModel } from '../../domain';
import { IOrderPlaceProductView } from '../interfaces';

export interface IOrderPlaceRepositoryPort {
  findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductView[]>;
  insert(order: OrderModel): Promise<OrderModel>;
}

export const ORDER_PLACE_REPOSITORY_PORT = Symbol('ORDER_PLACE_REPOSITORY_PORT');
