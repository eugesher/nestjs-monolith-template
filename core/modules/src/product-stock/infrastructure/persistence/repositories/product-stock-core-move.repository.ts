import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  IProductStockCoreMoveRepositoryPort,
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

  public async insertMany(queries: IProductStockCoreMovementInsertQuery[]): Promise<string[]> {
    if (queries.length === 0) {
      return [];
    }

    const result = await this.productStockRepository.insert(queries);
    const identifiers = result.identifiers as { id: number | string }[];

    return identifiers.map((identifier) => String(identifier.id));
  }
}
