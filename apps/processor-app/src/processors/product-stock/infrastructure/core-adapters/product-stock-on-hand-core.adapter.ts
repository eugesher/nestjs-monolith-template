import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import {
  PRODUCT_STOCK_CORE_PORT,
  type IProductStockCorePort,
} from '@acme-core/contracts/product-stock';

import {
  IProductStockOnHandLockCommand,
  IProductStockOnHandPort,
  IProductStockOnHandView,
  PRODUCT_STOCK_ON_HAND_PORT,
} from '../../outbound';

@Injectable()
export class ProductStockOnHandCoreAdapter implements IProductStockOnHandPort {
  public static readonly provider: ClassProvider<IProductStockOnHandPort> = {
    provide: PRODUCT_STOCK_ON_HAND_PORT,
    useClass: ProductStockOnHandCoreAdapter,
  };

  constructor(
    @Inject(PRODUCT_STOCK_CORE_PORT)
    private readonly productStock: IProductStockCorePort,
  ) {}

  public async lock(command: IProductStockOnHandLockCommand): Promise<IProductStockOnHandView[]> {
    const { productIds } = command;

    return await this.productStock.handleLock({ productIds });
  }
}
