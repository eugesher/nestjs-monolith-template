import { SelectQueryBuilder } from 'typeorm';

import { Order, OrderProduct, Product } from '@acme-core/entities';

import { IOrderGetManyQuery, IOrderGetOneQuery } from '../../../outbound';

export class OrderPersistenceBuilder extends SelectQueryBuilder<Order> {
  private readonly orderProductAlias = OrderProduct.name;
  private readonly productAlias = Product.name;

  public forList(query: IOrderGetManyQuery): this {
    const { limit, offset, customerId } = query;

    this.selectOrder()
      .whereCustomer(customerId)
      .addOrderBy(`${this.alias}.id`, 'DESC')
      .skip(offset)
      .take(limit);

    return this;
  }

  public forOwned(query: IOrderGetOneQuery): this {
    const { orderId, customerId } = query;

    this.selectOrder()
      .joinOrderProducts()
      .joinProducts()
      .whereId(orderId)
      .whereCustomer(customerId)
      .withDeleted();

    return this;
  }

  public forPlaced(orderId: string): this {
    this.selectOrder().joinOrderProducts().joinProducts().whereId(orderId);

    return this;
  }

  private selectOrder(): this {
    this.select([`${this.alias}.id`, `${this.alias}.createdAt`]);

    return this;
  }

  private joinOrderProducts(): this {
    this.leftJoin(`${this.alias}.orderProducts`, this.orderProductAlias)
      .addSelect([`${this.orderProductAlias}.id`, `${this.orderProductAlias}.productId`])
      .addOrderBy(`${this.orderProductAlias}.id`, 'ASC');

    return this;
  }

  private joinProducts(): this {
    this.leftJoin(`${this.orderProductAlias}.product`, this.productAlias).addSelect([
      `${this.productAlias}.id`,
      `${this.productAlias}.sku`,
      `${this.productAlias}.name`,
    ]);

    return this;
  }

  private whereId(id: string): this {
    this.andWhere(`${this.alias}.id = :id`, { id });

    return this;
  }

  private whereCustomer(customerId: string): this {
    this.andWhere(`${this.alias}.customerId = :customerId`, { customerId });

    return this;
  }
}
