import { SelectQueryBuilder } from 'typeorm';

import { ProductStatusEnum } from '@acme-libs/kernel';
import { Product } from '@acme-core/entities';

export class OrderQueryProductBuilder extends SelectQueryBuilder<Product> {
  constructor(queryBuilder: SelectQueryBuilder<Product>) {
    super(queryBuilder);
  }

  public forActive(productIds: string[]): this {
    this.select([`${this.alias}.id`])
      .where(`${this.alias}.id IN (:...productIds)`, { productIds })
      .andWhere(`${this.alias}.status = :status`, { status: ProductStatusEnum.ACTIVE });

    return this;
  }
}
