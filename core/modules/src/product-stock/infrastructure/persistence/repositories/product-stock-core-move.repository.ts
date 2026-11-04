import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IProductStockCoreMoveRepositoryPort,
  IProductStockCoreMovementInsertedRecord,
  IProductStockCoreMovementInsertQuery,
} from '../../../outbound';
import { ProductStockCoreBaseRepository } from './base/product-stock-core-base.repository';

@Injectable()
export class ProductStockCoreMoveRepository
  extends ProductStockCoreBaseRepository
  implements IProductStockCoreMoveRepositoryPort
{
  constructor(@Inject(REPOSITORY_HOST_PORT) repositoryHost: IRepositoryHostPort) {
    super(repositoryHost);
  }

  public async insertMany(
    queries: IProductStockCoreMovementInsertQuery[],
  ): Promise<IProductStockCoreMovementInsertedRecord[]> {
    if (queries.length === 0) {
      return [];
    }

    const result = await this.productStockRepository.insert(queries);

    return result.identifiers as IProductStockCoreMovementInsertedRecord[];
  }
}
