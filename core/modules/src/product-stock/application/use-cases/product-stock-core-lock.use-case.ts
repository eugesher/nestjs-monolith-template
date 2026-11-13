import { Inject, Injectable } from '@nestjs/common';

import type {
  IProductStockCoreLockCommand,
  IProductStockCoreOnHandView,
} from '@acme-core/contracts/product-stock';

import { ProductStockCoreOnHandModel } from '../../domain';
import {
  PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
  type IProductStockCoreLockRepositoryPort,
} from '../../outbound';

@Injectable()
export class ProductStockCoreLockUseCase {
  constructor(
    @Inject(PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT)
    private readonly repository: IProductStockCoreLockRepositoryPort,
  ) {}

  public async execute(
    command: IProductStockCoreLockCommand,
  ): Promise<IProductStockCoreOnHandView[]> {
    const { productIds } = command;
    const lockedProducts = await this.repository.lockProducts(productIds);
    const lockedIds = lockedProducts.map((product) => product.id);
    const stockSums = await this.repository.sumStock(lockedIds);
    const onHand = ProductStockCoreOnHandModel.reconstitute({
      productIds: lockedIds,
      sums: stockSums,
    });

    return onHand.toSnapshot();
  }
}
