import { Injectable } from '@nestjs/common';

import { RepositoryHost } from '@acme-libs/database';

import { type IProductStockCoreLockRepositoryPort } from '../../../outbound';
import { ProductStockCoreBaseRepository } from './base/product-stock-core-base.repository';

@Injectable()
export class ProductStockCoreLockRepository
  extends ProductStockCoreBaseRepository
  implements IProductStockCoreLockRepositoryPort
{
  constructor(repositoryHost: RepositoryHost) {
    super(repositoryHost);
  }
}
