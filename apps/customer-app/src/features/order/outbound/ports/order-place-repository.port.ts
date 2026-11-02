import { IOrderDraft, OrderModel } from '../../domain';
import { IOrderPlaceProductView } from '../interfaces';

export interface IOrderPlaceRepositoryPort {
  findActiveProducts(productIds: string[]): Promise<IOrderPlaceProductView[]>;
  insert(draft: IOrderDraft): Promise<OrderModel>;
}

export const ORDER_PLACE_REPOSITORY_PORT = Symbol('ORDER_PLACE_REPOSITORY_PORT');
