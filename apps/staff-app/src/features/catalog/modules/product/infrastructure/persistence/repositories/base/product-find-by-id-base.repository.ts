import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { ProductModel } from '../../../../domain';
import { ProductMapper } from '../../mappers/product.mapper';

export abstract class ProductFindByIdBaseRepository {
  protected constructor(protected readonly repositoryHost: RepositoryHost) {}

  protected get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findById(productId: string): Promise<Nullable<ProductModel>> {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    return product === null ? null : ProductMapper.toModel(product);
  }
}
