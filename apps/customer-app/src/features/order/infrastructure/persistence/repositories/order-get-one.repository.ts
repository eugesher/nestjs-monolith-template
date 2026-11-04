import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Order } from '@acme-core/entities';

import {
  IOrderGetOneQuery,
  IOrderGetOneRecord,
  IOrderGetOneRepositoryPort,
} from '../../../outbound';

@Injectable()
export class OrderGetOneRepository implements IOrderGetOneRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  public async findOwned(query: IOrderGetOneQuery): Promise<Nullable<IOrderGetOneRecord>> {
    const { orderId, customerId } = query;

    return await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .leftJoin('Order.orderProducts', 'OrderProduct')
      .addSelect(['OrderProduct.id', 'OrderProduct.productId'])
      .leftJoin('OrderProduct.product', 'Product')
      .addSelect(['Product.id', 'Product.sku', 'Product.name'])
      .where('Order.id = :orderId', { orderId })
      .andWhere('Order.customerId = :customerId', { customerId })
      .orderBy('OrderProduct.id', 'ASC')
      .withDeleted()
      .getOne();
  }
}
