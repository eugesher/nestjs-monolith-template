import { IOrderStock } from '../../domain';
import {
  IOrderPlaceProductView,
  IOrderProductStockView,
  IOrderProductStockWithdrawCommand,
} from '../../outbound';
import { IOrderProductView } from '../interfaces';

export class OrderProductStockMapper {
  public static toStock(
    products: IOrderPlaceProductView[],
    quantities: IOrderProductStockView[],
  ): IOrderStock[] {
    return products.map((product) => {
      const onHand = quantities.find((candidate) => candidate.productId === product.productId);

      return { ...product, quantity: onHand?.quantity ?? 0 };
    });
  }

  public static toMovements(
    products: IOrderProductView[],
  ): IOrderProductStockWithdrawCommand['movements'] {
    return products.map((product) => ({
      productId: product.productId,
      orderProductId: product.id,
    }));
  }
}
