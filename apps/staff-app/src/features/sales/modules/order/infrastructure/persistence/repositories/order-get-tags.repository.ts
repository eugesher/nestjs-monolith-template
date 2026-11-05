import { Inject, Injectable } from '@nestjs/common';

import {
  IHostedRepository,
  type IRepositoryHostPort,
  REPOSITORY_HOST_PORT,
} from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';
import { Order } from '@acme-core/entities';

import { IOrderGetTagsRecord, IOrderGetTagsRepositoryPort } from '../../../outbound';

@Injectable()
export class OrderGetTagsRepository implements IOrderGetTagsRepositoryPort {
  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    private readonly repositoryHost: IRepositoryHostPort,
  ) {}

  private get orderRepository(): IHostedRepository<Order> {
    return this.repositoryHost.getRepository(Order);
  }

  public async findById(orderId: string): Promise<Nullable<IOrderGetTagsRecord>> {
    return await this.orderRepository
      .createQueryBuilder('Order')
      .select(['Order.id'])
      .where('Order.id = :orderId', { orderId })
      .getOne();
  }
}
