import { SelectQueryBuilder } from 'typeorm';

import { Product } from '@acme-core/entities';

export class ProductStockPersistenceProductBuilder extends SelectQueryBuilder<Product> {
  public forById(productId: string): this {
    this.select([`${this.alias}.id`, `${this.alias}.sku`]).where(`${this.alias}.id = :productId`, {
      productId,
    });

    return this;
  }
}
