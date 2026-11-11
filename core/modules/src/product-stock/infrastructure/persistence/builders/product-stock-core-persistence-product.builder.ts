import { SelectQueryBuilder } from 'typeorm';

import type { Product } from '@acme-core/entities';

export class ProductStockCorePersistenceProductBuilder extends SelectQueryBuilder<Product> {
  public forLockProducts(productIds: string[]): this {
    this.select([`${this.alias}.id`])
      .where(`${this.alias}.id IN (:...productIds)`, { productIds })
      .orderBy(`${this.alias}.id`, 'ASC')
      .setLock('pessimistic_write');

    return this;
  }
}
