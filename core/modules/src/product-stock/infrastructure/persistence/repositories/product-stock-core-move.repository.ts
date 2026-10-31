import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

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
  constructor(transactionHost: TransactionHost<TransactionalAdapterTypeOrm>) {
    super(transactionHost);
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
