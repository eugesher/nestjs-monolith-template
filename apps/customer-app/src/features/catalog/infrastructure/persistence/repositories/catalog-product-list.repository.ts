import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { Product } from '@acme-core/entities';

import {
  ICatalogProductListRepositoryPort,
  ICatalogProductListQuery,
  ICatalogProductListRecord,
} from '../../../outbound';

@Injectable()
export class CatalogProductListRepository implements ICatalogProductListRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async list(query: ICatalogProductListQuery): Promise<ICatalogProductListRecord> {
    const { limit, offset } = query;

    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id', 'Product.sku', 'Product.name'])
      .where('Product.status = :status', { status: ProductStatusEnum.ACTIVE })
      .orderBy('Product.id', 'ASC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
