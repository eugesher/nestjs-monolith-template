import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IProductStockCoreLockRepositoryPort,
  PRODUCT_STOCK_CORE_LOCK_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }
}
