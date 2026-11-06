import { SelectQueryBuilder } from 'typeorm';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { Product } from '@acme-core/entities';

export class ProductStockPersistenceProductBuilder extends SelectQueryBuilder<Product> {
  public forActive(productIds: string[]): this {
    this.select([`${this.alias}.id`])
      .where(`${this.alias}.id IN (:...productIds)`, { productIds })
      .andWhere(`${this.alias}.status = :status`, { status: ProductStatusEnum.ACTIVE })
      .orderBy(`${this.alias}.id`, 'ASC');

    return this;
  }
}
