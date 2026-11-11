import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
  type IProductStockCoreLockRepositoryPort,
} from '../../../outbound';
import { ProductStockCoreBaseRepository } from './base/product-stock-core-base.repository';

@Injectable()
export class ProductStockCoreLockRepository
  extends ProductStockCoreBaseRepository
  implements IProductStockCoreLockRepositoryPort
{
  public static readonly provider: ClassProvider<IProductStockCoreLockRepositoryPort> = {
    provide: PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
    useClass: ProductStockCoreLockRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }
}
