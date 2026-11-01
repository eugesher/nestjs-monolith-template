import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { Product } from '@acme-core/entities';

import { type IProductStockArchiveOutOfStockRepositoryPort } from '../../../outbound';

@Injectable()
export class ProductStockArchiveOutOfStockRepository implements IProductStockArchiveOutOfStockRepositoryPort {
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findActive(productIds: string[]): Promise<string[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.productRepository.find({
      select: { id: true },
      where: { id: In(productIds), status: ProductStatusEnum.ACTIVE },
      order: { id: 'ASC' },
    });

    return products.map((product) => product.id);
  }
}
