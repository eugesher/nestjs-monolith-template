import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { ORM_PORT, type IOrmPort } from '@acme-libs/contracts/database';

import {
  PRODUCT_STOCK_CORE_MOVE_REPOSITORY_PORT,
  type IProductStockCoreMoveInsertQuery,
  type IProductStockCoreMoveInsertRecord,
  type IProductStockCoreMoveRepositoryPort,
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
    @Inject(ORM_PORT)
    protected readonly orm: IOrmPort,
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
