import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IProductStockPostSubtractRepositoryPort,
  IProductStockPostSubtractProductRecord,
  PRODUCT_STOCK_POST_SUBTRACT_REPOSITORY_PORT,
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
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
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
