import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  IProductStockAddProductRecord,
  IProductStockAddRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findById(productId: string): Promise<Nullable<IProductStockAddProductRecord>> {
    return await this.createProductBuilder().forById(productId).getOne();
  }
}
