import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import { IProductStockCoreLockRepositoryPort } from '../../../outbound';
import { ProductStockCoreBaseRepository } from './base/product-stock-core-base.repository';

@Injectable()
export class ProductStockCoreLockRepository
  extends ProductStockCoreBaseRepository
  implements IProductStockCoreLockRepositoryPort
{
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }
}
