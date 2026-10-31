import { Inject, Injectable } from '@nestjs/common';

import {
  type IProductStockCorePort,
  PRODUCT_STOCK_CORE_PORT,
} from '@acme-core/contracts/product-stock';
import {
  IProductStockOnHandLockCommand,
  IProductStockOnHandPort,
  IProductStockOnHandView,
} from '../../outbound';

@Injectable()
export class ProductStockOnHandCoreAdapter implements IProductStockOnHandPort {
  constructor(
    @Inject(PRODUCT_STOCK_CORE_PORT)
    private readonly productStock: IProductStockCorePort,
  ) {}

  public async lock(command: IProductStockOnHandLockCommand): Promise<IProductStockOnHandView[]> {
    const { productIds } = command;
    const stock = await this.productStock.lock({ productIds });

    return stock.map((row) => ({ productId: row.productId, quantity: row.quantity }));
  }
}
