import { Inject, Injectable } from '@nestjs/common';

import {
  IProductStockCoreLockCommand,
  IProductStockCoreOnHandView,
} from '@acme-core/contracts/product-stock';

import {
  PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
  type IProductStockCoreLockRepositoryPort,
} from '../../outbound';
import { ProductStockCoreOnHandMapper } from '../mappers/product-stock-core-on-hand.mapper';

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

    return ProductStockCoreOnHandMapper.toViews(lockedIds, sums);
  }
}
