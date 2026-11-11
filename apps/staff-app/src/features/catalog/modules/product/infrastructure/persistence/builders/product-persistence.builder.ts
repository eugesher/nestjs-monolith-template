import { SelectQueryBuilder } from 'typeorm';

import type { Product } from '@acme-core/entities';

import type { IProductGetManyListQuery } from '../../../outbound';

export class ProductPersistenceBuilder extends SelectQueryBuilder<Product> {
  public forById(productId: string): this {
    this.selectProduct().whereId(productId);

    return this;
  }

  public forExistsBySku(sku: string): this {
    this.where(`${this.alias}.sku = :sku`, { sku });

    return this;
  }

  public forInserted(productId: string): this {
    this.selectProduct().whereId(productId);

    return this;
  }

  public forList(query: IProductGetManyListQuery): this {
    const { limit, offset, productIds } = query;

    this.selectProduct();

    if (productIds !== undefined) {
      this.andWhere(`${this.alias}.id IN (:...productIds)`, { productIds });
    }

    this.orderBy(`${this.alias}.id`, 'DESC').skip(offset).take(limit);

    return this;
  }

  public forLockById(productId: string): this {
    this.select([`${this.alias}.id`])
      .whereId(productId)
      .setLock('pessimistic_write');

    return this;
  }

  private selectProduct(): this {
    this.select([
      `${this.alias}.id`,
      `${this.alias}.sku`,
      `${this.alias}.name`,
      `${this.alias}.status`,
      `${this.alias}.version`,
      `${this.alias}.createdAt`,
      `${this.alias}.updatedAt`,
    ]);

    return this;
  }

  private whereId(productId: string): this {
    this.andWhere(`${this.alias}.id = :productId`, { productId });

    return this;
  }
}
