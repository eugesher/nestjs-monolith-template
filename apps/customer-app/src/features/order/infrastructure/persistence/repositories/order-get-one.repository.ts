import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Order, OrderProduct, Product } from '@acme-core/entities';

import { IOrderProductRecord, OrderModel } from '../../../domain';
import { IOrderFindOwnedQuery, IOrderGetOneRepositoryPort } from '../../../outbound';

@Injectable()
export class OrderGetOneRepository implements IOrderGetOneRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): Repository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  private get orderProductRepository(): Repository<OrderProduct> {
    return this.repositoryHost.getRepository(OrderProduct);
  }

  public async findOwned(query: IOrderFindOwnedQuery): Promise<Nullable<OrderModel>> {
    const { orderId, customerId } = query;
    const order = await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .where('Order.id = :orderId', { orderId })
      .andWhere('Order.customerId = :customerId', { customerId })
      .getOne();

    if (!order) {
      return null;
    }

    const products = await this.orderProductRepository
      .createQueryBuilder('OrderProduct')
      .select('OrderProduct.id', 'id')
      .addSelect('OrderProduct.productId', 'productId')
      .addSelect('Product.sku', 'sku')
      .addSelect('Product.name', 'name')
      .innerJoin(Product, 'Product', 'Product.id = OrderProduct.productId')
      .where('OrderProduct.orderId = :orderId', { orderId })
      .orderBy('OrderProduct.id', 'ASC')
      .withDeleted()
      .getRawMany<IOrderProductRecord>();

    return OrderModel.reconstitute({
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt,
      products,
    });
  }
}
