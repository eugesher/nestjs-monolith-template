import { Order } from '@acme-core/entities';
import { IOrderProductRecord, OrderModel } from '../../../domain';

export class OrderMapper {
  public static toModel(order: Order, products: IOrderProductRecord[]): OrderModel {
    return OrderModel.reconstitute({
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt,
      products,
    });
  }
}
