import { SelectQueryBuilder } from 'typeorm';

import type { ProductStock } from '@acme-core/entities';

export class ProductStockCorePersistenceBuilder extends SelectQueryBuilder<ProductStock> {
  public forSumStock(productIds: string[]): this {
    this.select(`${this.alias}.productId`, 'productId')
      .addSelect(`SUM(${this.alias}.quantity)`, 'quantity')
      .where(`${this.alias}.productId IN (:...productIds)`, { productIds })
      .groupBy(`${this.alias}.productId`)
      .setLock('pessimistic_read');

    return this;
  }
}
