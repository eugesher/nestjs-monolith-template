import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { IPage } from '@acme-libs/toolkit';
import { Order } from '@acme-core/entities';

import { IOrderGetManyRepositoryPort, IOrderListedView, IOrderPageQuery } from '../../../outbound';

@Injectable()
export class OrderGetManyRepository implements IOrderGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  public async list(query: IOrderPageQuery): Promise<IPage<IOrderListedView>> {
    const { page, size } = query;
    const [orders, total] = await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .orderBy('Order.id', 'DESC')
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();
    const items = orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt,
    }));

    return { items, total, page, size };
  }
}
