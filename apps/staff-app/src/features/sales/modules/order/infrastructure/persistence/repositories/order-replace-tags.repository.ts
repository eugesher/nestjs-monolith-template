import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Order } from '@acme-core/entities';

import { IOrderReplaceTagsRecord, IOrderReplaceTagsRepositoryPort } from '../../../outbound';

@Injectable()
export class OrderReplaceTagsRepository implements IOrderReplaceTagsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  public async lockById(orderId: string): Promise<Nullable<IOrderReplaceTagsRecord>> {
    return await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id'])
      .where('Order.id = :orderId', { orderId })
      .setLock('pessimistic_write')
      .getOne();
  }
}
