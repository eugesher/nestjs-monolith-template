import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { REPOSITORY_HOST_PORT, type IRepositoryHostPort } from '@acme-libs/contracts/database';

import {
  IProductStockCoreMoveInsertQuery,
  IProductStockCoreMoveInsertRecord,
  IProductStockCoreMoveRepositoryPort,
  PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
} from '../../../outbound';
import { ProductStockCoreBaseRepository } from './base/product-stock-core-base.repository';

@Injectable()
export class ProductStockCoreMoveRepository
  extends ProductStockCoreBaseRepository
  implements IProductStockCoreMoveRepositoryPort
{
  public static readonly provider: ClassProvider<IProductStockCoreMoveRepositoryPort> = {
    provide: PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
    useClass: ProductStockCoreMoveRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async insertMany(
    queries: IProductStockCoreMoveInsertQuery[],
  ): Promise<IProductStockCoreMoveInsertRecord[]> {
    if (queries.length === 0) {
      return [];
    }

    const result = await this.productStockRepository.insert(queries);

    return result.identifiers as IProductStockCoreMoveInsertRecord[];
  }
}
