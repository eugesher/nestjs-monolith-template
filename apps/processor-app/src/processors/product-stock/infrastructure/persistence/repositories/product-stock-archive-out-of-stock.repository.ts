import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { In, Repository } from 'typeorm';

import { Product } from '@acme-core/entities';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { type IProductStockArchiveOutOfStockRepositoryPort } from '../../../outbound';

@Injectable()
export class ProductStockArchiveOutOfStockRepository implements IProductStockArchiveOutOfStockRepositoryPort {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>) {}

  private get products(): Repository<Product> {
    return this.txHost.tx.getRepository(Product);
  }

  public async findActive(productIds: string[]): Promise<string[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.products.find({
      select: { id: true },
      where: { id: In(productIds), status: ProductStatusEnum.ACTIVE },
      order: { id: 'ASC' },
    });

    return products.map((product) => product.id);
  }
}
