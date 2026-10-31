import { Inject, Injectable } from '@nestjs/common';

import {
  IProductStockCoreLockCommand,
  IProductStockCoreOnHandView,
} from '@acme-core/contracts/product-stock';
import {
  type IProductStockCoreLockRepositoryPort,
  PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
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

    return await this.repository.sumStock(locked);
  }
}
