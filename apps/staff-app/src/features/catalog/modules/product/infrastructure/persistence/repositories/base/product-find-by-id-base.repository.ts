import { Repository } from 'typeorm';

import type { IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { ProductModel } from '../../../../domain';
import { ProductMapper } from '../../mappers/product.mapper';

export abstract class ProductFindByIdBaseRepository {
  protected constructor(protected readonly repositoryHost: IRepositoryHostPort) {}

  protected get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findById(productId: string): Promise<Nullable<ProductModel>> {
    const product = await this.productRepository
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

    return product === null ? null : ProductMapper.toModel(product);
  }
}
