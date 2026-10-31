import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';

import { Product, ProductStock } from '@acme-core/entities';
import { IProductStockCoreSumView } from '../../../../outbound';

export abstract class ProductStockCoreBaseRepository {
  protected constructor(
    protected readonly transactionHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  protected get productRepository(): Repository<Product> {
    return this.transactionHost.tx.getRepository(Product);
  }

  protected get productStockRepository(): Repository<ProductStock> {
    return this.transactionHost.tx.getRepository(ProductStock);
  }

  public async lockProducts(productIds: string[]): Promise<string[]> {
    if (productIds.length === 0) {
      return [];
    }

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id IN (:...productIds)', { productIds })
      .orderBy('product.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();

    return products.map((product) => product.id);
  }

  public async sumStock(productIds: string[]): Promise<IProductStockCoreSumView[]> {
    if (productIds.length === 0) {
      return [];
    }

    const rows = await this.productStockRepository
      .createQueryBuilder('stock')
      .select('stock.productId', 'productId')
      .addSelect('SUM(stock.quantity)', 'quantity')
      .where('stock.productId IN (:...productIds)', { productIds })
      .groupBy('stock.productId')
      .setLock('pessimistic_read')
      .getRawMany<{ productId: string; quantity: number | string }>();

    return productIds.map((productId) => {
      const row = rows.find((candidate) => candidate.productId === productId);

      return { productId, quantity: Number(row?.quantity ?? 0) };
    });
  }
}
