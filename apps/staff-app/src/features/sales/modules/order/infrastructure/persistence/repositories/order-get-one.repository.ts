import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Order } from '@acme-core/entities';

import { IOrderFoundView, IOrderGetOneRepositoryPort } from '../../../outbound';

@Injectable()
export class OrderGetOneRepository implements IOrderGetOneRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  public async findById(orderId: string): Promise<Nullable<IOrderFoundView>> {
    const order = await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .leftJoin('Order.orderProducts', 'OrderProduct')
      .addSelect(['OrderProduct.id', 'OrderProduct.productId'])
      .leftJoin('OrderProduct.product', 'Product')
      .addSelect(['Product.id', 'Product.sku', 'Product.name'])
      .where('Order.id = :orderId', { orderId })
      .orderBy('OrderProduct.id', 'ASC')
      .withDeleted()
      .getOne();

    if (!order) {
      return null;
    }

    const products = order.orderProducts.map((orderProduct) => {
      const { id, productId, product } = orderProduct;

      return { id, productId, sku: product.sku, name: product.name };
    });

    return { id: order.id, customerId: order.customerId, createdAt: order.createdAt, products };
  }
}
