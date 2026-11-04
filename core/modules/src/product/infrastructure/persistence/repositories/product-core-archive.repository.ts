import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import {
  IProductCoreArchiveRepositoryPort,
  IProductCoreLockedRecord,
  IProductCoreWriteUpdateQuery,
} from '../../../outbound';

@Injectable()
export class ProductCoreArchiveRepository implements IProductCoreArchiveRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async lockById(productId: string): Promise<Nullable<IProductCoreLockedRecord>> {
    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id', 'Product.sku', 'Product.status', 'Product.version'])
      .where('Product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();
  }

  public async update(query: IProductCoreWriteUpdateQuery): Promise<void> {
    const { id, versionAsRead, status, version } = query;

    await this.productRepository.update({ id, version: versionAsRead }, { status, version });
  }
}
