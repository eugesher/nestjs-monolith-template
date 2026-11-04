import { IOrderFoundRecord, IOrderListedRecord } from '../../outbound';
import { IOrderGetManyView, IOrderGetOneView } from '../interfaces';

export class OrderViewMapper {
  public static toGetOneView(order: IOrderFoundRecord): IOrderGetOneView {
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

  public static toGetManyViewItem(order: IOrderListedRecord): IOrderGetManyView['data'][number] {
    return {
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
