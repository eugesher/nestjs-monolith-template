import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';
import { Nullable } from '@acme-libs/toolkit';

import {
  IOrderGetTagsRecord,
  IOrderGetTagsRepositoryPort,
  ORDER_GET_TAGS_REPOSITORY_PORT,
} from '../../../outbound';
import { OrderPersistenceHost } from '../host/order-persistence.host';

@Injectable()
export class OrderGetTagsRepository
  extends OrderPersistenceHost
  implements IOrderGetTagsRepositoryPort
{
  public static readonly provider: ClassProvider<IOrderGetTagsRepositoryPort> = {
    provide: ORDER_GET_TAGS_REPOSITORY_PORT,
    useClass: OrderGetTagsRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async findExisting(orderId: string): Promise<Nullable<IOrderGetTagsRecord>> {
    return await this.createOrderBuilder().forExisting(orderId).getOne();
  }
}
