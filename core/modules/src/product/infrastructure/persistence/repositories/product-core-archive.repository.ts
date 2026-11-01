import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RepositoryHost } from '@acme-libs/database';
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
  constructor(private readonly repositoryHost: RepositoryHost) {}

  private get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async lockById(productId: string): Promise<Nullable<ProductCoreModel>> {
    const product = await this.productRepository
      .createQueryBuilder('Product')
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
