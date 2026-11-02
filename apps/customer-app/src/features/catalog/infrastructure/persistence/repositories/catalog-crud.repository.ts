import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { IPage } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import {
  type ICatalogCrudRepositoryPort,
  ICatalogPageQuery,
  ICatalogProductRowView,
} from '../../../outbound';

@Injectable()
export class CatalogCrudRepository implements ICatalogCrudRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async list(query: ICatalogPageQuery): Promise<IPage<ICatalogProductRowView>> {
    const { page, size } = query;
    const [products, total] = await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id', 'Product.sku', 'Product.name'])
      .where('Product.status = :status', { status: ProductStatusEnum.ACTIVE })
      .orderBy('Product.id', 'ASC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
    const items = products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
    }));

    return { items, total, page, size };
  }
}
