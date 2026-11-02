import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  type IProductStockCoreMoveRepositoryPort,
  IProductStockCoreMovementInsertCommand,
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

  public async insertMany(commands: IProductStockCoreMovementInsertCommand[]): Promise<string[]> {
    if (commands.length === 0) {
      return [];
    }

    const result = await this.productStockRepository.insert(commands);
    const identifiers = result.identifiers as { id: number | string }[];

    return identifiers.map((identifier) => String(identifier.id));
  }
}
