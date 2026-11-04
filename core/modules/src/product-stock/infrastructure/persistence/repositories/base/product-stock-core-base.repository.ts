import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Product, ProductStock } from '@acme-core/entities';

import {
  IProductStockCoreLockProductRecord,
  IProductStockCoreLockSumRecord,
  IProductStockCoreLockSumRecordItem,
} from '../../../../outbound';

export abstract class ProductStockCoreBaseRepository {
  protected constructor(protected readonly repositoryHost: IRepositoryHostPort) {}

  protected get productRepository(): IHostedRepository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  protected get productStockRepository(): IHostedRepository<ProductStock> {
    return this.repositoryHost.getRepository(ProductStock);
  }

  public async lockProducts(productIds: string[]): Promise<IProductStockCoreLockProductRecord> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id'])
      .where('Product.id IN (:...productIds)', { productIds })
      .orderBy('Product.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();
  }

  public async sumStock(productIds: string[]): Promise<IProductStockCoreLockSumRecord> {
    if (productIds.length === 0) {
      return [];
    }

    return await this.productStockRepository
      .createQueryBuilder('ProductStock')
      .select('ProductStock.productId', 'productId')
      .addSelect('SUM(ProductStock.quantity)', 'quantity')
      .where('ProductStock.productId IN (:...productIds)', { productIds })
      .groupBy('ProductStock.productId')
      .setLock('pessimistic_read')
      .getRawMany<IProductStockCoreLockSumRecordItem>();
  }
}
