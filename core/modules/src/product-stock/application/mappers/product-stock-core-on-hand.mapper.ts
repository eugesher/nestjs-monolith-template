import { IProductStockCoreOnHandView } from '@acme-core/contracts/product-stock';

import { IProductStockCoreLockSumRecord } from '../../outbound';

export class ProductStockCoreOnHandMapper {
  public static toViews(
    productIds: string[],
    sums: IProductStockCoreLockSumRecord[],
  ): IProductStockCoreOnHandView[] {
    return productIds.map((productId) => {
      const sum = sums.find((candidate) => candidate.productId === productId);

      return { productId, quantity: Number(sum?.quantity ?? 0) };
    });
  }
}
