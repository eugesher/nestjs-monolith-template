import { OrderModel } from '../../domain';
import { IOrderListedView } from '../../outbound';
import { IOrderSummaryView } from '../interfaces/views/order-summary.view';
import { IOrderView } from '../interfaces/views/order.view';

export class OrderViewMapper {
  public static toView(order: OrderModel): IOrderView {
    const createdAt = order.createdAt ?? new Date();
    const products = order.products.map((product) => ({
      id: product.id ?? '',
      productId: product.productId,
      sku: product.sku,
      name: product.name,
    }));

    return {
      id: order.id ?? '',
      createdAt: createdAt.toISOString(),
      products,
    };
  }

  public static toSummaryView(order: IOrderListedView): IOrderSummaryView {
    return {
      id: order.id,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
