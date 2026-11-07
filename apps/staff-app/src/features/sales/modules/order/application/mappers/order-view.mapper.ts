import { IOrderGetManyRecordItem, IOrderGetOneRecord } from '../../outbound';
import { IOrderGetManyView, IOrderGetOneView } from '../interfaces';

export class OrderViewMapper {
  public static toGetOneView(order: IOrderGetOneRecord): IOrderGetOneView {
    const products = order.orderProducts.map((orderProduct) => ({
      id: orderProduct.id,
      productId: orderProduct.productId,
      sku: orderProduct.product.sku,
      name: orderProduct.product.name,
    }));

    return {
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt.toISOString(),
      products,
    };
  }

  public static toGetManyViewItem(
    order: IOrderGetManyRecordItem,
  ): IOrderGetManyView['data'][number] {
    return {
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
