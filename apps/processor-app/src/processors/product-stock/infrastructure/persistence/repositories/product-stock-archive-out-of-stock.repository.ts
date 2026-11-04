import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { ProductStatusEnum } from '@acme-libs/kernel';
import { Product } from '@acme-core/entities';

import {
  IProductStockArchiveOutOfStockRepositoryPort,
  IProductStockArchiveOutOfStockProductRecord,
} from '../../../outbound';

@Injectable()
export class ProductStockArchiveOutOfStockRepository implements IProductStockArchiveOutOfStockRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  public async findActive(
    productIds: string[],
  ): Promise<IProductStockArchiveOutOfStockProductRecord[]> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id'])
      .where('Product.id IN (:...productIds)', { productIds })
      .andWhere('Product.status = :status', { status: ProductStatusEnum.ACTIVE })
      .orderBy('Product.id', 'ASC')
      .getMany();
  }
}
