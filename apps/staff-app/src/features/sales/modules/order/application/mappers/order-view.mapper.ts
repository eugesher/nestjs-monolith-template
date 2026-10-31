import { IOrderFoundView, IOrderListedView } from '../../outbound';
import { IOrderSummaryView } from '../interfaces/views/order-summary.view';
import { IOrderView } from '../interfaces/views/order.view';

export class OrderViewMapper {
  public static toView(order: IOrderFoundView): IOrderView {
    const products = order.products.map((product) => ({
      id: product.id,
      productId: product.productId,
      sku: product.sku,
      name: product.name,
    }));

    return {
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt.toISOString(),
      products,
    };
  }

  public static toSummaryView(order: IOrderListedView): IOrderSummaryView {
    return {
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
