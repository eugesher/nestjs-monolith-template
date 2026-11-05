import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { IProductReplaceTagsRecord, IProductReplaceTagsRepositoryPort } from '../../../outbound';

@Injectable()
export class ProductReplaceTagsRepository implements IProductReplaceTagsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async lockById(productId: string): Promise<Nullable<IProductReplaceTagsRecord>> {
    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id'])
      .where('Product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();
  }
}
