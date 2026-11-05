import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Product } from '@acme-core/entities';

import {
  IProductCreateRepositoryPort,
  IProductCreateRecord,
  IProductCreateInsertQuery,
} from '../../../outbound';

@Injectable()
export class ProductCreateRepository implements IProductCreateRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async existsBySku(sku: string): Promise<boolean> {
    return await this.productRepository
      .createQueryBuilder('Product')
      .where('Product.sku = :sku', { sku })
      .getExists();
  }

  public async insert(query: IProductCreateInsertQuery): Promise<string> {
    return await this.productRepository.insertOne(query);
  }

  public async findInserted(productId: string): Promise<IProductCreateRecord> {
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
      .where('Product.id = :productId', { productId })
      .getOneOrFail();
  }
}
