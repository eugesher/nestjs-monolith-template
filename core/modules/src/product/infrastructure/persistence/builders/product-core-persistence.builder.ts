import { SelectQueryBuilder } from 'typeorm';

import type { Product } from '@acme-core/entities';

export class ProductCorePersistenceBuilder extends SelectQueryBuilder<Product> {
  public forLockById(productId: string): this {
    this.select([
      `${this.alias}.id`,
      `${this.alias}.sku`,
      `${this.alias}.status`,
      `${this.alias}.version`,
    ])
      .where(`${this.alias}.id = :productId`, { productId })
      .setLock('pessimistic_write');

    return this;
  }
}
