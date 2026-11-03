import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { IProductFoundRecord } from '../../../../outbound';

export abstract class ProductBaseRepository {
  protected constructor(protected readonly repositoryHost: IRepositoryHostPort) {}

  protected get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findById(productId: string): Promise<Nullable<IProductFoundRecord>> {
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
      .getOne();
  }
}
