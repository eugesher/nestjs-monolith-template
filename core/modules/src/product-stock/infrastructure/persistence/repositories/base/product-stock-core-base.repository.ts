import { Repository } from 'typeorm';

import type { IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Product, ProductStock } from '@acme-core/entities';

import { IProductStockCoreSumView } from '../../../../outbound';

export abstract class ProductStockCoreBaseRepository {
  protected constructor(protected readonly repositoryHost: IRepositoryHostPort) {}

  protected get productRepository(): Repository<Product> {
    return this.repositoryHost.getRepository(Product);
  }

  protected get productStockRepository(): Repository<ProductStock> {
    return this.repositoryHost.getRepository(ProductStock);
  }

  public async lockProducts(productIds: string[]): Promise<string[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.productRepository
      .createQueryBuilder('Product')
      .select(['Product.id'])
      .where('Product.id IN (:...productIds)', { productIds })
      .orderBy('Product.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();

    return products.map((product) => product.id);
  }

  public async sumStock(productIds: string[]): Promise<IProductStockCoreSumView[]> {
    if (productIds.length === 0) {
      return [];
    }

    const rows = await this.productStockRepository
      .createQueryBuilder('ProductStock')
      .select('ProductStock.productId', 'productId')
      .addSelect('SUM(ProductStock.quantity)', 'quantity')
      .where('ProductStock.productId IN (:...productIds)', { productIds })
      .groupBy('ProductStock.productId')
      .setLock('pessimistic_read')
      .getRawMany<{ productId: string; quantity: number | string }>();

    return productIds.map((productId) => {
      const row = rows.find((candidate) => candidate.productId === productId);

      return { productId, quantity: Number(row?.quantity ?? 0) };
    });
  }
}
