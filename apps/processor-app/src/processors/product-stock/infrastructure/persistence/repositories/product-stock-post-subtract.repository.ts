import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT,
  type IProductStockPostSubtractProductRecord,
  type IProductStockPostSubtractRepositoryPort,
} from '../../../outbound';
import { ProductStockPersistenceHost } from '../host/product-stock-persistence.host';

@Injectable()
export class ProductStockPostSubtractRepository
  extends ProductStockPersistenceHost
  implements IProductStockPostSubtractRepositoryPort
{
  public static readonly provider: ClassProvider<IProductStockPostSubtractRepositoryPort> = {
    provide: PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT,
    useClass: ProductStockPostSubtractRepository,
  };

  constructor(
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
  ) {
    super();
  }

  public async findActive(productIds: string[]): Promise<IProductStockPostSubtractProductRecord[]> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.createProductBuilder().forActive(productIds).getMany();
  }
}
