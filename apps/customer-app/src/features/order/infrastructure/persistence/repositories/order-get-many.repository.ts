import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
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

  public async list(query: IOrderPageQuery): Promise<[IOrderListedView[], number]> {
    const { limit, offset, customerId } = query;

    return await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.createdAt'])
      .where('Order.customerId = :customerId', { customerId })
      .orderBy('Order.id', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }
}
