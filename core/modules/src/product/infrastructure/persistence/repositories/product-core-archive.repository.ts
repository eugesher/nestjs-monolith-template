import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { ProductCoreModel } from '../../../domain';
import {
  type IProductCoreArchiveRepositoryPort,
  IProductCoreWriteUpdateCommand,
} from '../../../outbound';
import { ProductCoreMapper } from '../mappers/product-core.mapper';

@Injectable()
export class ProductCoreArchiveRepository implements IProductCoreArchiveRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async lockById(productId: string): Promise<Nullable<ProductCoreModel>> {
    const product = await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id', 'Product.sku', 'Product.status', 'Product.version'])
      .where('Product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();

    return product === null ? null : ProductCoreMapper.toModel(product);
  }

  public async update(command: IProductCoreWriteUpdateCommand): Promise<void> {
    const { product, versionAsRead } = command;

    await this.productRepository.update(
      { id: product.id, version: versionAsRead },
      { status: product.status, version: product.version },
    );
  }
}
