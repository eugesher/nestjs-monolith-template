import { SelectQueryBuilder } from 'typeorm';

import { Order, OrderProduct, Product } from '@acme-core/entities';

import { IOrderGetManyListQuery } from '../../../outbound';

export class OrderPersistenceBuilder extends SelectQueryBuilder<Order> {
  private readonly orderProductAlias = OrderProduct.name;
  private readonly productAlias = Product.name;

  public forList(query: IOrderGetManyListQuery): this {
    const { limit, offset, orderIds } = query;

    this.selectOrder();

    if (orderIds !== undefined) {
      this.andWhere(`${this.alias}.id IN (:...orderIds)`, { orderIds });
    }

    this.orderBy(`${this.alias}.id`, 'DESC').skip(offset).take(limit);

    return this;
  }

  public forById(orderId: string): this {
    this.withDeleted()
      .selectOrder()
      .leftJoin(`${this.alias}.orderProducts`, this.orderProductAlias)
      .addSelect([`${this.orderProductAlias}.id`, `${this.orderProductAlias}.productId`])
      .leftJoin(`${this.orderProductAlias}.product`, this.productAlias)
      .addSelect([
        `${this.productAlias}.id`,
        `${this.productAlias}.sku`,
        `${this.productAlias}.name`,
      ])
      .whereId(orderId)
      .orderBy(`${this.orderProductAlias}.id`, 'ASC');

    return this;
  }

  public forExisting(orderId: string): this {
    this.select([`${this.alias}.id`]).whereId(orderId);

    return this;
  }

  public forLockById(orderId: string): this {
    this.select([`${this.alias}.id`])
      .whereId(orderId)
      .setLock('pessimistic_write');

    return this;
  }

  private selectOrder(): this {
    this.select([`${this.alias}.id`, `${this.alias}.customerId`, `${this.alias}.createdAt`]);

    return this;
  }

  private whereId(orderId: string): this {
    this.andWhere(`${this.alias}.id = :orderId`, { orderId });

    return this;
  }
}
