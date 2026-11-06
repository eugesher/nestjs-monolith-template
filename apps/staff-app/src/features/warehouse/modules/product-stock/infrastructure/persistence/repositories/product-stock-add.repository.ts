import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IProductStockAddRepositoryPort,
  IProductStockAddProductRecord,
  PRODUCT_STOCK_ADD_REPOSITORY_PORT,
} from '../../../outbound';
import { ProductStockPersistenceHost } from '../host/product-stock-persistence.host';

@Injectable()
export class ProductStockAddRepository
  extends ProductStockPersistenceHost
  implements IProductStockAddRepositoryPort
{
  public static readonly provider: ClassProvider<IProductStockAddRepositoryPort> = {
    provide: PRODUCT_STOCK_ADD_REPOSITORY_PORT,
    useClass: ProductStockAddRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findById(productId: string): Promise<Nullable<IProductStockAddProductRecord>> {
    return await this.createProductBuilder().forById(productId).getOne();
  }
}
