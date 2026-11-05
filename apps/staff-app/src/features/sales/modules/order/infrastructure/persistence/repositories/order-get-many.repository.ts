import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Order } from '@acme-core/entities';

import {
  IOrderGetManyRepositoryPort,
  IOrderGetManyRecord,
  IOrderGetManyListQuery,
} from '../../../outbound';

@Injectable()
export class OrderGetManyRepository implements IOrderGetManyRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  public async list(query: IOrderGetManyListQuery): Promise<IOrderGetManyRecord> {
    const { limit, offset, orderIds } = query;
    const builder = this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt']);

    if (orderIds !== undefined) {
      builder.where('Order.id IN (:...orderIds)', { orderIds });
    }

    return await builder.orderBy('Order.id', 'DESC').skip(offset).take(limit).getManyAndCount();
  }
}
