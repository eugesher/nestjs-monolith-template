import { IOrderStock } from '../../domain';
import { IOrderPlaceProductView, IOrderProductStockView } from '../../outbound';

export class OrderStockMapper {
  public static toStock(
    products: IOrderPlaceProductView[],
    quantities: IOrderProductStockView[],
  ): IOrderStock[] {
    return products.map((product) => {
      const onHand = quantities.find((candidate) => candidate.productId === product.productId);

      return { ...product, quantity: onHand?.quantity ?? 0 };
    });
  }
}
