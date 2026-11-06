import { SelectQueryBuilder } from 'typeorm';

import { Order } from '@acme-core/entities';
import { IOrderGetManyQuery, IOrderGetOneQuery } from '../../../outbound';

export class OrderQueryBuilder extends SelectQueryBuilder<Order> {
  constructor(queryBuilder: SelectQueryBuilder<Order>) {
    super(queryBuilder);
  }

  public forList(query: IOrderGetManyQuery): this {
    const { limit, offset, customerId } = query;

    this.select([`${this.alias}.id`, `${this.alias}.createdAt`])
      .where(`${this.alias}.customerId = :customerId`, { customerId })
      .orderBy(`${this.alias}.id`, 'DESC')
      .skip(offset)
      .take(limit);

    return this;
  }

  public forOwned(query: IOrderGetOneQuery): this {
    const { orderId, customerId } = query;

    this.withProducts()
      .where(`${this.alias}.id = :orderId`, { orderId })
      .andWhere(`${this.alias}.customerId = :customerId`, { customerId })
      .withDeleted();

    return this;
  }

  public forPlaced(orderId: string): this {
    this.withProducts().where(`${this.alias}.id = :orderId`, { orderId });

    return this;
  }

  private withProducts(): this {
    this.select([`${this.alias}.id`, `${this.alias}.createdAt`])
      .leftJoin(`${this.alias}.orderProducts`, 'OrderProduct')
      .addSelect(['OrderProduct.id', 'OrderProduct.productId'])
      .leftJoin('OrderProduct.product', 'Product')
      .addSelect(['Product.id', 'Product.sku', 'Product.name'])
      .orderBy('OrderProduct.id', 'ASC');

    return this;
  }
}
