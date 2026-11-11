import { SelectQueryBuilder } from 'typeorm';

import { ProductStatusEnum } from '@acme-libs/kernel';
import type { Product } from '@acme-core/entities';

export class OrderPersistenceProductBuilder extends SelectQueryBuilder<Product> {
  public forActive(productIds: string[]): this {
    this.select([`${this.alias}.id`])
      .where(`${this.alias}.id IN (:...productIds)`, { productIds })
      .andWhere(`${this.alias}.status = :status`, { status: ProductStatusEnum.ACTIVE });

    return this;
  }
}
