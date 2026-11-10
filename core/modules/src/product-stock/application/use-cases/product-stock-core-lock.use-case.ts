import { Inject, Injectable } from '@nestjs/common';

import {
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
    const locked = await this.repository.lockProducts(productIds);
    const lockedIds = locked.map((product) => product.id);
    const sums = await this.repository.sumStock(lockedIds);
    const onHand = ProductStockCoreOnHandModel.reconstitute({ productIds: lockedIds, sums });

    return onHand.toSnapshot();
  }
}
