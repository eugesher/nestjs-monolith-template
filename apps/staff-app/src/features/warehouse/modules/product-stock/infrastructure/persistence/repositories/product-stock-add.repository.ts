import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Product } from '@acme-core/entities';

import { IProductStockAddRepositoryPort, IProductStockProductFoundRecord } from '../../../outbound';

@Injectable()
export class ProductStockAddRepository implements IProductStockAddRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findById(productId: string): Promise<Nullable<IProductStockProductFoundRecord>> {
    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id', 'Product.sku'])
      .where('Product.id = :productId', { productId })
      .getOne();
  }
}
