import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Product } from '@acme-core/entities';

import {
  IProductGetManyRepositoryPort,
  IProductGetManyRecord,
  IProductGetManyListQuery,
} from '../../../outbound';

@Injectable()
export class ProductGetManyRepository implements IProductGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async list(query: IProductGetManyListQuery): Promise<IProductGetManyRecord> {
    const { limit, offset } = query;

    return await this.productRepository
      .createQueryBuilder('Product')
      .select([
        'Product.id',
        'Product.sku',
        'Product.name',
        'Product.status',
        'Product.version',
        'Product.createdAt',
        'Product.updatedAt',
      ])
      .orderBy('Product.id', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
