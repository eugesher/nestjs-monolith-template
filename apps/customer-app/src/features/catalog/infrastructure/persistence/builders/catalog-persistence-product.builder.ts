import { SelectQueryBuilder } from 'typeorm';

import { ProductStatusEnum } from '@acme-libs/kernel';
import type { Product } from '@acme-core/entities';

import type { ICatalogProductListQuery } from '../../../outbound';

export class CatalogPersistenceProductBuilder extends SelectQueryBuilder<Product> {
  public forList(query: ICatalogProductListQuery): this {
    const { limit, offset } = query;

    this.select([`${this.alias}.id`, `${this.alias}.sku`, `${this.alias}.name`])
      .where(`${this.alias}.status = :status`, { status: ProductStatusEnum.ACTIVE })
      .orderBy(`${this.alias}.id`, 'ASC')
      .skip(offset)
      .take(limit);

    return this;
  }
}
