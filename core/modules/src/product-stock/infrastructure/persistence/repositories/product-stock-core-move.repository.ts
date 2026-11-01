import { Injectable } from '@nestjs/common';

import { RepositoryHost } from '@acme-libs/database';

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
  constructor(repositoryHost: RepositoryHost) {
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
