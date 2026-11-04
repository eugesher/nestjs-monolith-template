import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import { Order } from '@acme-core/entities';

import {
  IOrderGetManyRepositoryPort,
  IOrderListedRecord,
  IOrderPageQuery,
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

  public async list(query: IOrderPageQuery): Promise<IPage<IOrderListedRecord>> {
    const { page, limit, offset } = query;
    const [data, total] = await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id', 'Order.customerId', 'Order.createdAt'])
      .orderBy('Order.id', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return PaginationHelper.toPage(data, total, { page, limit });
  }
}
